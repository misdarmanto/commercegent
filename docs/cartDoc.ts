/**
 * @swagger
 * tags:
 *   name: CARTS
 *   description: Keranjang belanja user
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CartCreateRequest:
 *       type: object
 *       required:
 *         - cartProductId
 *         - cartProductVariantId
 *         - cartQuantity
 *       properties:
 *         cartProductId:
 *           type: integer
 *           minimum: 1
 *           example: 4
 *         cartProductVariantId:
 *           type: integer
 *           minimum: 1
 *           example: 12
 *         cartQuantity:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *     CartRemoveQuery:
 *       type: object
 *       required:
 *         - cartId
 *       properties:
 *         cartId:
 *           type: integer
 *           minimum: 1
 *           example: 33
 *     CartItem:
 *       type: object
 *       properties:
 *         cartId:
 *           type: integer
 *         cartUserId:
 *           type: integer
 *         cartProductId:
 *           type: integer
 *         cartProductVariantId:
 *           type: integer
 *         cartQuantity:
 *           type: integer
 *         deleted:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         product:
 *           type: object
 *           nullable: true
 *           description: Data produk dari relasi `ProductModel`
 *         variant:
 *           type: object
 *           nullable: true
 *           description: Data varian dari relasi `ProductVariantModel`
 */

/**
 * @swagger
 * /api/v1/carts:
 *   get:
 *     summary: Ambil daftar cart user login
 *     tags: [CARTS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Opsional (saat ini belum dipakai di where service)
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Jika `true`, pakai limit/offset
 *     responses:
 *       200:
 *         description: Data cart berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CartItem'
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (hanya role user)
 *       500:
 *         description: Server error
 *   post:
 *     summary: Tambah item ke cart user login
 *     description: |
 *       Jika kombinasi `cartProductId` + `cartProductVariantId` sudah ada untuk user yang sama,
 *       quantity akan ditambahkan. Jika belum ada, akan dibuat row baru.
 *     tags: [CARTS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartCreateRequest'
 *     responses:
 *       201:
 *         description: Cart berhasil ditambahkan
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (hanya role user)
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Hapus item cart user login (soft delete)
 *     tags: [CARTS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Cart berhasil dihapus
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (hanya role user)
 *       404:
 *         description: Cart tidak ditemukan
 *       500:
 *         description: Server error
 */
