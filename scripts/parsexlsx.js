/**
 * Script Node.js untuk mengubah file Excel "Data Barang.xlsx"
 * menjadi file JSON dalam bentuk array of object.
 *
 * Cara penggunaan:
 * 1. Install dependency:
 *    npm install xlsx
 *
 * 2. Simpan file ini sebagai excel-to-json.js
 *
 * 3. Jalankan:
 *    node excel-to-json.js
 *
 * 4. Hasil akan tersimpan pada file:
 *    data-barang.json
 */

const XLSX = require('xlsx')
const fs = require('fs')
const path = require('path')

// Path file input dan output
const inputFile = path.join(__dirname, 'Data Barang.xlsx')
const outputFile = path.join(__dirname, 'data-barang.json')

// Nama sheet yang akan dibaca
const sheetName = 'Barang'

try {
  // Baca workbook Excel
  const workbook = XLSX.readFile(inputFile)

  // Pastikan sheet tersedia
  if (!workbook.SheetNames.includes(sheetName)) {
    throw new Error(`Sheet "${sheetName}" tidak ditemukan.`)
  }

  // Ambil sheet
  const worksheet = workbook.Sheets[sheetName]

  // Konversi sheet menjadi array of objects
  const data = XLSX.utils.sheet_to_json(worksheet, {
    defval: null, // Isi sel kosong dengan null
    raw: false // Format nilai sebagai string jika diperlukan
  })

  // Simpan ke file JSON
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf8')

  console.log(`Berhasil mengonversi ${data.length} baris data.`)
  console.log(`File JSON tersimpan di: ${outputFile}`)
} catch (error) {
  console.error('Terjadi kesalahan:', error.message)
}
