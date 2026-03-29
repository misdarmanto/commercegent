/**
 * @swagger
 * components:
 *   schemas:
 *     CreateProduct:
 *       type: object
 *       required:
 *         - productName
 *         - productPrice
 *         - productCategoryId
 *       properties:
 *         productName:
 *           type: string
 *           example: "Wireless Mouse"
 *         productDescription:
 *           type: string
 *           example: "A comfortable wireless mouse with ergonomic design."
 *         productImages:
 *           type: string
 *           example: "https://example.com/images/mouse.jpg"
 *         productPrice:
 *           type: number
 *           example: 199000
 *         productCategoryId:
 *           type: string
 *           example: "C001"
 *         productSubCategoryId:
 *           type: string
 *         productCode:
 *           type: string
 *           example: "C001"
 *         productTotalSale:
 *           type: number
 *           example: 340
 *         productStock:
 *           type: number
 *           example: 150
 *         productDiscount:
 *           type: number
 *           example: 10
 *         productWeight:
 *           type: number
 *           example: 0.25
 *     Product:
 *       type: object
 *       required:
 *         - productName
 *         - productPrice
 *         - productCategoryId
 *       properties:
 *         productId:
 *           type: string
 *           example: "P12345"
 *         productName:
 *           type: string
 *           example: "Wireless Mouse"
 *         productDescription:
 *           type: string
 *           example: "A comfortable wireless mouse with ergonomic design."
 *         productImages:
 *           type: string
 *           example: "https://example.com/images/mouse.jpg"
 *         productPrice:
 *           type: number
 *           example: 199000
 *         productCategoryId:
 *           type: string
 *           example: "C001"
 *         productSubCategoryId:
 *           type: string
 *         productCode:
 *           type: string
 *           example: "C001"
 *         productTotalSale:
 *           type: number
 *           example: 340
 *         productStock:
 *           type: number
 *           example: 150
 *         productDiscount:
 *           type: number
 *           example: 10
 *         productWeight:
 *           type: number
 *           example: 0.25
 */

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products
 *     tags: [PRODUCTS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Page number
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Page size
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: productCategoryId
 *         schema:
 *           type: string
 *         description: Filter by product category ID
 *       - in: query
 *         name: productSubCategoryId
 *         schema:
 *           type: string
 *         description: Filter by product sub-category ID
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Enable pagination
 *     responses:
 *       200:
 *         description: List of users
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/products/highlights:
 *   get:
 *     summary: Get all products highlights
 *     tags: [PRODUCTS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Page number
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Page size
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: productCategoryId
 *         schema:
 *           type: string
 *         description: Filter by product category ID
 *       - in: query
 *         name: productSubCategoryId
 *         schema:
 *           type: string
 *         description: Filter by product sub-category ID
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Enable pagination
 *     responses:
 *       200:
 *         description: List of users
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/products/detail/{productId}:
 *   get:
 *     summary: Get a product by productId
 *     tags: [PRODUCTS]
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create a new product
 *     tags: [PRODUCTS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProduct'
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
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/products:
 *   patch:
 *     summary: Update an existing product
 *     tags: [PRODUCTS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
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
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/products/{productId}:
 *   delete:
 *     summary: Delete a product by productId
 *     tags: [PRODUCTS]
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The productId of the product to delete
 *     responses:
 *       200:
 *         description: Product deleted successfully
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
 *                   example: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
