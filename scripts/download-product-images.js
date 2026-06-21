/**
 * Download product images from the web by product name (supports thousands of items;
 * product names are often Indonesian — use OPENAI_API_KEY for best English search queries).
 *
 * Input (JSON):
 *   • Search by name: [{"name":"Kopi Arabika"},{"name":"Susu UHT"}]
 *   • Direct URL (no search; use your own licensed URLs, e.g. supplier feed):
 *       [{"name":"Kopi","imageUrl":"https://cdn.example.com/kopi.jpg"}]
 *     If imageUrl is set, it is downloaded as-is; name is used for the output filename.
 *
 * Flow (when imageUrl omitted):
 * 1. (Strongly recommended) OPENAI_API_KEY — phrase biased to retail packaging (not plants/farms/people).
 * 2. Search query is augmented with retail / packaging keywords for all providers.
 * 3. Collect several image URLs (Google up to 10, Pexels/Unsplash up to 8); try each until one passes validation.
 * 4. Validate binary (magic bytes, reject HTML, min size) so corrupt or non-images are skipped.
 * 5. Save with correct extension from sniff or Content-Type.
 *
 * *Google: create a Programmable Search Engine (https://programmablesearchengine.google.com/),
 *   enable “Search the entire web”, then use its cx + API key from Google Cloud.
 *
 * Usage:
 *   node scripts/download-product-images.js --file ./scripts/products.json --out ./scripts/product-images
 *   node scripts/download-product-images.js --file ./products.json --start 0 --limit 500 --delay 800
 *
 * Env:
 *   OPENAI_API_KEY      — recommended for Indonesian names → better queries
 *   GOOGLE_API_KEY      — Google Cloud API key
 *   GOOGLE_CSE_ID       — Programmable Search Engine ID (cx) with Image search / entire web
 *   PEXELS_API_KEY      — https://www.pexels.com/api/
 *   UNSPLASH_ACCESS_KEY — https://unsplash.com/developers
 *
 * Google free tier is limited (see Cloud billing); for thousands of items use billing + sensible --delay.
 */

const axios = require('axios')
const dotenv = require('dotenv')
const fs = require('fs')
const path = require('path')

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const PEXELS_API_KEY = process.env.PEXELS_API_KEY
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID

const DEFAULT_UA =
  'FreshEcommerceImageDownloader/1.1 (+https://github.com; Node.js axios; contact: dev)'

/** Appended to every image search to bias toward SKU / packaging, not plants or farms. */
const RETAIL_IMAGE_SUFFIX = 'packaged consumer product retail white background no people'

/** Min bytes for a plausible product photo (avoids empty / tracking pixels). */
const MIN_IMAGE_BYTES = 800

/** Max extra retries after first attempt (429/502/503). Set from --retries in main(). */
let gHttpRetries = 3

/**
 * @param {string} core
 * @returns {string}
 */
function augmentRetailSearchQuery(core) {
  const t = String(core).trim()
  if (t === '') return RETAIL_IMAGE_SUFFIX
  return `${t} ${RETAIL_IMAGE_SUFFIX}`
}

/**
 * @param {Buffer} buf
 * @returns {{ mime: string, ext: string } | null}
 */
function sniffImageFormat(buf) {
  if (buf == null || buf.length < 12) return null
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { mime: 'image/jpeg', ext: '.jpg' }
  }
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return { mime: 'image/png', ext: '.png' }
  }
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) {
    return { mime: 'image/gif', ext: '.gif' }
  }
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) {
    const webp = buf.slice(8, 12).toString('ascii')
    if (webp === 'WEBP') return { mime: 'image/webp', ext: '.webp' }
  }
  return null
}

/**
 * @param {Buffer} buf
 * @returns {boolean}
 */
function looksLikeHtmlResponse(buf) {
  const head = buf
    .slice(0, Math.min(600, buf.length))
    .toString('utf8')
    .trimStart()
    .toLowerCase()
  return (
    head.startsWith('<!doctype') ||
    head.startsWith('<html') ||
    head.startsWith('<head') ||
    head.startsWith('<?xml')
  )
}

/**
 * @param {Buffer} buf
 * @param {string | undefined} contentType
 * @throws {Error}
 */
function assertValidImageBuffer(buf, contentType) {
  if (buf.length < MIN_IMAGE_BYTES) {
    throw new Error(`image too small (${buf.length} bytes)`)
  }
  if (looksLikeHtmlResponse(buf)) {
    throw new Error('response is HTML, not an image')
  }
  const ct = contentType ?? ''
  if (ct.includes('text/html') || ct.includes('application/json')) {
    throw new Error(`bad content-type: ${ct}`)
  }
  const sniff = sniffImageFormat(buf)
  if (sniff == null && !String(ct).toLowerCase().startsWith('image/')) {
    throw new Error('not a recognized image binary')
  }
}

/**
 * @param {unknown} value
 * @returns {value is string}
 */
function isHttpUrlString(value) {
  if (typeof value !== 'string') return false
  const t = value.trim()
  if (t === '') return false
  try {
    const u = new URL(t)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * @param {unknown} raw
 * @returns {{ name: string, imageUrl: string | null }[]}
 */
function parseJsonProductItems(raw) {
  if (!Array.isArray(raw)) return []

  /** @type {{ name: string, imageUrl: string | null }[]} */
  const items = []

  for (const o of raw) {
    if (o == null || typeof o !== 'object') continue

    const nameField = o.name
    const urlField = o.imageUrl

    const nameStr = typeof nameField === 'string' ? nameField.trim() : ''
    const urlStr =
      typeof urlField === 'string' && isHttpUrlString(urlField) ? urlField.trim() : null

    if (nameStr !== '') {
      items.push({ name: nameStr, imageUrl: urlStr })
      continue
    }

    if (urlStr != null) {
      let derived = 'product'
      try {
        const u = new URL(urlStr)
        const seg = u.pathname.split('/').filter(Boolean).pop()
        if (seg) {
          derived = seg.replace(/\.[^.]+$/i, '') || 'product'
        }
      } catch {
        derived = 'product'
      }
      items.push({ name: derived, imageUrl: urlStr })
    }
  }

  return items
}

function parseArgs() {
  const argv = process.argv.slice(2)
  /** @type {{ name: string, imageUrl: string | null }[]} */
  let items = []
  let outDir = path.resolve(__dirname, 'product-images')
  let delayMs = 600
  let start = 0
  let limit = Number.POSITIVE_INFINITY
  let retries = 3
  let progressEvery = 50

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--file' && argv[i + 1]) {
      const filePath = path.resolve(process.cwd(), argv[++i])
      const raw = fs.readFileSync(filePath, 'utf8')
      const trimmed = raw.trim()

      if (trimmed.startsWith('[')) {
        let parsed
        try {
          parsed = JSON.parse(trimmed)
        } catch (e) {
          console.error(`Invalid JSON in ${filePath}: ${String(e)}`)
          process.exit(1)
        }
        if (!Array.isArray(parsed)) {
          console.error('JSON root must be an array, e.g. [{"name":"Kopi"}]')
          process.exit(1)
        }
        items = parseJsonProductItems(parsed)
      } else {
        items = raw
          .split(/\r?\n/)
          .map((line) => line.replace(/^\s*[-*]\s*/, '').trim())
          .filter((line) => line.length > 0 && !line.startsWith('#'))
          .map((line) => ({ name: line, imageUrl: null }))
      }
    } else if (a === '--out' && argv[i + 1]) {
      outDir = path.resolve(process.cwd(), argv[++i])
    } else if (a === '--delay' && argv[i + 1]) {
      delayMs = Math.max(0, Number(argv[++i]) || 0)
    } else if (a === '--start' && argv[i + 1]) {
      start = Math.max(0, Number(argv[++i]) || 0)
    } else if (a === '--limit' && argv[i + 1]) {
      limit = Math.max(1, Number(argv[++i]) || 1)
    } else if (a === '--retries' && argv[i + 1]) {
      retries = Math.max(0, Number(argv[++i]) || 0)
    } else if (a === '--progress-every' && argv[i + 1]) {
      progressEvery = Math.max(1, Number(argv[++i]) || 1)
    }
  }

  if (items.length === 0) {
    console.error(`
Usage:
  node scripts/download-product-images.js --file ./scripts/products.json --out ./scripts/product-images

products.json (search by name):
  [{"name":"Kopi Bubuk"},{"name":"Susu UHT"}]

products.json (direct image URL — no search; you must have rights to use the URL):
  [{"name":"Kopi","imageUrl":"https://cdn.example.com/kopi.jpg"}]

Options:
  --file             JSON array as above OR plain text (one name per line; search mode only)
  --out              Output directory (default: scripts/product-images)
  --delay            Ms pause after each product (default: 600; raise for large batches / quotas)
  --start            0-based index into the name list (for batching)
  --limit            Max items to process from --start (default: all)
  --retries          Retries per HTTP step on 429/503 (default: 3)
  --progress-every   Log progress every N items (default: 50)

Recommended for Indonesian + “whole web” images:
  OPENAI_API_KEY + GOOGLE_API_KEY + GOOGLE_CSE_ID (Image search, search entire web)
`)
    process.exit(1)
  }

  const sliced = items.slice(start, start + limit)
  return {
    items: sliced,
    totalInFile: items.length,
    start,
    outDir,
    delayMs,
    retries,
    progressEvery
  }
}

function sanitizeBaseName(name) {
  const trimmed = name.trim()
  const noExt = trimmed.replace(/\.(jpe?g|png|webp|gif)$/i, '')
  const safe = noExt
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()
  return safe.length > 0 ? safe : 'product'
}

function extFromContentType(ct) {
  if (!ct) return '.jpg'
  if (ct.includes('png')) return '.png'
  if (ct.includes('webp')) return '.webp'
  if (ct.includes('gif')) return '.gif'
  if (ct.includes('jpeg') || ct.includes('jpg')) return '.jpg'
  return '.jpg'
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * @template T
 * @param {() => Promise<T>} fn
 * @param {{ retries: number, label: string }} opts
 */
async function withRetries(fn, opts) {
  const { retries, label } = opts
  let lastErr
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (e) {
      lastErr = e
      const status = axios.isAxiosError(e) ? e.response?.status : null
      const retryable = status === 429 || status === 503 || status === 502
      if (!retryable || attempt === retries) {
        throw e
      }
      const wait = Math.min(30_000, 800 * 2 ** attempt)
      console.warn(
        `[retry] ${label} attempt ${attempt + 1}/${retries} in ${wait}ms (${String(
          status
        )})`
      )
      await sleep(wait)
    }
  }
  throw lastErr
}

async function refineSearchQueryWithOpenAI(productName) {
  if (OPENAI_API_KEY == null || OPENAI_API_KEY === '') {
    return productName
  }

  const { data } = await withRetries(
    () =>
      axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You write ONE short English phrase for IMAGE SEARCH to find a RETAIL CONSUMER PRODUCT photo. ' +
                'Must look like e-commerce / supermarket: bottle, jar, can, carton, sachet, bag, tub — on white or neutral background. ' +
                'STRICTLY AVOID: coffee plant, coffee tree, plantation, farm, field, nature landscape, barista, people drinking, memes, diagrams, logos only. ' +
                'For "coffee" prefer: instant coffee jar, ground coffee bag, coffee can, coffee bottle — NOT tree or cherry. ' +
                'For beverages: packaged drink product. For food: packaged food product. ' +
                'No quotes, 3–10 words, no trailing punctuation, no brand names.'
            },
            {
              role: 'user',
              content: `Product name (may be Indonesian): "${productName}"\nEnglish image search phrase only:`
            }
          ],
          temperature: 0.2,
          max_tokens: 48
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 45_000
        }
      ),
    { retries: gHttpRetries, label: 'openai' }
  )

  const text = data?.choices?.[0]?.message?.content
  if (typeof text !== 'string' || text.trim() === '') {
    return productName
  }
  return text
    .trim()
    .replace(/^["']|["']$/g, '')
    .split('\n')[0]
    .trim()
}

/**
 * @param {string} query
 * @returns {Promise<string[]>}
 */
async function findImageUrlsGoogleCse(query) {
  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) return []

  const { data } = await withRetries(
    () =>
      axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: GOOGLE_API_KEY,
          cx: GOOGLE_CSE_ID,
          q: query,
          searchType: 'image',
          num: 10,
          safe: 'off'
        },
        timeout: 25_000,
        headers: { 'User-Agent': DEFAULT_UA }
      }),
    { retries: gHttpRetries, label: 'google-cse' }
  )

  const items = data?.items
  if (!Array.isArray(items)) return []
  return items
    .map((it) => it?.link)
    .filter((u) => typeof u === 'string' && /^https?:\/\//i.test(u))
}

/**
 * @param {string} query
 * @returns {Promise<string[]>}
 */
async function findImageUrlsPexels(query) {
  if (PEXELS_API_KEY == null || PEXELS_API_KEY === '') return []

  const { data } = await withRetries(
    () =>
      axios.get('https://api.pexels.com/v1/search', {
        params: { query, per_page: 8, orientation: 'square' },
        headers: { Authorization: PEXELS_API_KEY },
        timeout: 20_000
      }),
    { retries: gHttpRetries, label: 'pexels' }
  )

  const photos = data?.photos
  if (!Array.isArray(photos)) return []
  /** @type {string[]} */
  const urls = []
  for (const p of photos) {
    const u = p?.src?.large ?? p?.src?.medium ?? p?.src?.original
    if (typeof u === 'string') urls.push(u)
  }
  return urls
}

/**
 * @param {string} query
 * @returns {Promise<string[]>}
 */
async function findImageUrlsUnsplash(query) {
  if (UNSPLASH_ACCESS_KEY == null || UNSPLASH_ACCESS_KEY === '') return []

  const { data } = await withRetries(
    () =>
      axios.get('https://api.unsplash.com/search/photos', {
        params: { query, per_page: 8, orientation: 'squarish' },
        headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
        timeout: 20_000
      }),
    { retries: gHttpRetries, label: 'unsplash' }
  )

  const results = data?.results
  if (!Array.isArray(results)) return []
  /** @type {string[]} */
  const urls = []
  for (const r of results) {
    const u = r?.urls?.regular ?? r?.urls?.small
    if (typeof u === 'string') urls.push(u)
  }
  return urls
}

/**
 * @param {string} query
 * @returns {Promise<string[]>}
 */
async function findImageUrlsWikimedia(query) {
  const { data } = await withRetries(
    () =>
      axios.get('https://commons.wikimedia.org/w/api.php', {
        params: {
          action: 'query',
          format: 'json',
          generator: 'search',
          gsrsearch: query,
          gsrnamespace: 6,
          gsrlimit: 8,
          prop: 'imageinfo',
          iiprop: 'url|mime',
          iiurlwidth: 1200
        },
        timeout: 20_000,
        headers: { 'User-Agent': DEFAULT_UA }
      }),
    { retries: gHttpRetries, label: 'wikimedia' }
  )

  const pages = data?.query?.pages
  if (pages == null || typeof pages !== 'object') return []

  /** @type {string[]} */
  const urls = []
  for (const page of Object.values(pages)) {
    const url = page?.imageinfo?.[0]?.url
    if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
      urls.push(url)
    }
  }
  return urls
}

/**
 * @param {string} imageUrl
 * @returns {Promise<{ buffer: Buffer, headers: import('axios').AxiosResponse['headers'] }>}
 */
async function fetchImageBuffer(imageUrl) {
  const { data, headers } = await withRetries(
    () =>
      axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 90_000,
        maxContentLength: 15 * 1024 * 1024,
        headers: { 'User-Agent': DEFAULT_UA },
        validateStatus: (s) => s >= 200 && s < 400
      }),
    { retries: gHttpRetries, label: 'download' }
  )
  return { buffer: Buffer.from(data), headers }
}

/**
 * @param {{ url: string, source: string }[]} candidates
 * @param {string} destBase path ending in .jpg (extension replaced)
 * @returns {Promise<{ source: string, finalPath: string, url: string }>}
 */
async function downloadFirstValidCandidate(candidates, destBase) {
  const errors = []
  for (const { url, source } of candidates) {
    try {
      const { buffer, headers } = await fetchImageBuffer(url)
      assertValidImageBuffer(buffer, headers['content-type'])
      const sniff = sniffImageFormat(buffer)
      const extFromCt = extFromContentType(headers['content-type'])
      const ext = sniff != null ? sniff.ext : extFromCt
      const finalPath = destBase.replace(/\.(jpe?g|png|webp|gif)$/i, '') + ext
      fs.writeFileSync(finalPath, buffer)
      return { source, finalPath, url }
    } catch (e) {
      const short = url.length > 72 ? `${url.slice(0, 72)}…` : url
      errors.push(`${short}: ${String(e)}`)
    }
  }
  throw new Error(
    `No valid image after ${candidates.length} URL(s). Examples: ${errors
      .slice(0, 3)
      .join(' | ')}`
  )
}

/**
 * @param {string} coreQuery phrase from OpenAI or raw product name
 * @returns {Promise<{ url: string, source: string }[]>}
 */
async function buildImageCandidates(coreQuery) {
  const qRetail = augmentRetailSearchQuery(coreQuery)
  /** @type {{ url: string, source: string }[]} */
  const ordered = []

  const pushUnique = (arr, url, source) => {
    if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) return
    if (arr.some((x) => x.url === url)) return
    arr.push({ url, source })
  }

  for (const u of await findImageUrlsGoogleCse(qRetail)) {
    pushUnique(ordered, u, 'google-cse')
  }
  for (const u of await findImageUrlsPexels(qRetail)) {
    pushUnique(ordered, u, 'pexels')
  }
  for (const u of await findImageUrlsUnsplash(qRetail)) {
    pushUnique(ordered, u, 'unsplash')
  }
  for (const u of await findImageUrlsWikimedia(qRetail)) {
    pushUnique(ordered, u, 'wikimedia')
  }

  if (ordered.length === 0) {
    const qAlt = augmentRetailSearchQuery(`${coreQuery} jar bottle pack`)
    for (const u of await findImageUrlsGoogleCse(qAlt)) {
      pushUnique(ordered, u, 'google-cse')
    }
    for (const u of await findImageUrlsPexels(qAlt)) {
      pushUnique(ordered, u, 'pexels')
    }
  }

  return ordered
}

async function resolveAndDownloadSearchImage(coreSearchPhrase, destBase) {
  const candidates = await buildImageCandidates(coreSearchPhrase)
  if (candidates.length === 0) {
    throw new Error(
      'No image URL found. Set GOOGLE_API_KEY+GOOGLE_CSE_ID (recommended), ' +
        'or PEXELS_API_KEY / UNSPLASH_ACCESS_KEY. For Indonesian names, set OPENAI_API_KEY.'
    )
  }
  return downloadFirstValidCandidate(candidates, destBase)
}

async function main() {
  const { items, totalInFile, start, outDir, delayMs, progressEvery, retries } =
    parseArgs()
  gHttpRetries = retries

  const anySearchOnly = items.some((it) => it.imageUrl == null)

  if (anySearchOnly) {
    if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
      console.warn(
        '[warn] GOOGLE_API_KEY / GOOGLE_CSE_ID not set — skipping Google image search (whole web). ' +
          'Stock APIs + Wikimedia only; Indonesian names work best with Google + OpenAI.'
      )
    }
    if (!OPENAI_API_KEY) {
      console.warn(
        '[warn] OPENAI_API_KEY not set — using raw product names as search query; ' +
          'Indonesian labels may return weaker image matches.'
      )
    }
    if (!PEXELS_API_KEY && !UNSPLASH_ACCESS_KEY && (!GOOGLE_API_KEY || !GOOGLE_CSE_ID)) {
      console.warn(
        '[warn] No Google / Pexels / Unsplash keys — Wikimedia Commons only (results vary; check licenses).'
      )
    }
  }

  fs.mkdirSync(outDir, { recursive: true })

  let ok = 0
  let fail = 0
  const total = items.length

  console.log(
    `[run] batch size=${total} (file total=${totalInFile}, start=${start}), delayMs=${delayMs}, outDir=${outDir}`
  )

  for (let i = 0; i < items.length; i++) {
    const { name: rawName, imageUrl: directUrl } = items[i]
    const base = sanitizeBaseName(rawName)
    const destBase = path.join(outDir, `${base}.jpg`)

    if (progressEvery > 0 && i > 0 && i % progressEvery === 0) {
      console.log(`[progress] ${i}/${total} ok=${ok} fail=${fail}`)
    }

    try {
      if (directUrl != null) {
        const { buffer, headers } = await fetchImageBuffer(directUrl)
        assertValidImageBuffer(buffer, headers['content-type'])
        const sniff = sniffImageFormat(buffer)
        const ext =
          sniff != null ? sniff.ext : extFromContentType(headers['content-type'])
        const finalPath = destBase.replace(/\.(jpe?g|png|webp|gif)$/i, '') + ext
        fs.writeFileSync(finalPath, buffer)
        source = 'direct-url'
        queryLog = directUrl.length > 96 ? `${directUrl.slice(0, 96)}…` : directUrl
        console.log(
          `[ok] (${i + 1}/${total}) "${rawName}" → ${path.basename(
            finalPath
          )} (${source}, url="${queryLog}")`
        )
      } else {
        const searchCore = await refineSearchQueryWithOpenAI(rawName)
        const { source: src, finalPath } = await resolveAndDownloadSearchImage(
          searchCore,
          destBase
        )
        source = src
        queryLog = `${searchCore} (+ retail packaging bias)`
        console.log(
          `[ok] (${i + 1}/${total}) "${rawName}" → ${path.basename(
            finalPath
          )} (${source}, q="${queryLog}")`
        )
      }
      ok++
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? JSON.stringify({
            message: e.message,
            status: e.response?.status,
            data: e.response?.data
          })
        : String(e)
      console.error(`[fail] (${i + 1}/${total}) "${rawName}": ${msg}`)
      fail++
    }

    if (i < items.length - 1 && delayMs > 0) {
      await sleep(delayMs)
    }
  }

  console.log(`\nDone. success=${ok} failed=${fail} outDir=${outDir}`)
  process.exit(fail > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
