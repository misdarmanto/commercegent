/**
 * @swagger
 * tags:
 *   name: PUBLIC PRODUCTS
 *   description: Public product management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateProductPublic:
 *       type: object
 *       required:
 *         - code
 *         - barcode
 *         - name
 *         - stock
 *         - price
 *         - weight
 *         - unit
 *         - isVisible
 *       properties:
 *         code:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           example: "SKU-001"
 *         barcode:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           example: "8991234567890"
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 150
 *           example: "Produk Contoh"
 *         stock:
 *           type: integer
 *           minimum: 0
 *           example: 100
 *         price:
 *           type: integer
 *           minimum: 0
 *           example: 15000
 *         weight:
 *           type: number
 *           format: float
 *           minimum: 0
 *           example: 0.5
 *         unit:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           example: "pcs"
 *         isVisible:
 *           type: boolean
 *           example: true
 *
 *     UpdateProductPublic:
 *       type: object
 *       required:
 *         - code
 *       properties:
 *         code:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           example: "SKU-001"
 *         barcode:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           example: "8991234567890"
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 150
 *           example: "Produk Contoh Update"
 *         stock:
 *           type: integer
 *           minimum: 0
 *           example: 80
 *         price:
 *           type: integer
 *           minimum: 0
 *           example: 14000
 *         weight:
 *           type: number
 *           format: float
 *           minimum: 0
 *           example: 0.45
 *         unit:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           example: "pcs"
 *         isVisible:
 *           type: boolean
 *           example: false
 */
/**
 * @swagger
 * /api/v1/public/orders:
 *   get:
 *     summary: Get list of orders
 *     tags: [PUBLIC]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Page number (pagination)
 *
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *
 *       - in: query
 *         name: orderStatus
 *         schema:
 *           type: string
 *           enum: [waiting, process, draft, delivery, done, cancel]
 *         description: Filter orders by status
 *
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-01-01
 *         description: Start date filter (YYYY-MM-DD)
 *
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-01-31
 *         description: End date filter (YYYY-MM-DD)
 *
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: number
 *                       example: 10
 *                     totalPages:
 *                       type: number
 *                       example: 1
 *                     currentPage:
 *                       type: number
 *                       example: 0
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/public/products:
 *   post:
 *     summary: Create public product
 *     tags: [PUBLIC]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductPublic'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Product created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/public/products:
 *   patch:
 *     summary: Update public product by code
 *     tags: [PUBLIC]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProductPublic'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Product updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
