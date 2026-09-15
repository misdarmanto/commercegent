/**
 * @swagger
 * tags:
 *   name: PRODUCTS
 *   description: Product management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductVariantCreate:
 *       type: object
 *       required:
 *         - productVariantName
 *         - productVariantPrice
 *         - productVariantSellPrice
 *         - productVariantStock
 *         - productVariantWeight
 *       properties:
 *         productVariantProductId:
 *           type: integer
 *           description: Optional (diisi otomatis oleh service saat nested create)
 *         productVariantName:
 *           type: string
 *         productVariantImage:
 *           type: string
 *         productVariantPrice:
 *           type: number
 *         productVariantSellPrice:
 *           type: number
 *         productVariantStock:
 *           type: integer
 *         productVariantDiscount:
 *           type: number
 *           default: 0
 *         productVariantWeight:
 *           type: number
 *         productVariantColor:
 *           type: string
 *         productVariantSize:
 *           type: string
 *       example:
 *         productVariantName: "Hitam - M"
 *         productVariantImage: "https://cdn.example.com/products/variant-black-m.jpg"
 *         productVariantPrice: 150000
 *         productVariantSellPrice: 135000
 *         productVariantStock: 30
 *         productVariantDiscount: 10
 *         productVariantWeight: 250
 *         productVariantColor: "Black"
 *         productVariantSize: "M"
 *     ProductVariantUpdate:
 *       type: object
 *       description: Jika `productVariantId` ada -> update variant existing. Jika tidak ada -> create variant baru.
 *       properties:
 *         productVariantId:
 *           type: integer
 *         productVariantProductId:
 *           type: integer
 *         productVariantName:
 *           type: string
 *         productVariantImage:
 *           type: string
 *         productVariantPrice:
 *           type: number
 *         productVariantSellPrice:
 *           type: number
 *         productVariantStock:
 *           type: integer
 *         productVariantDiscount:
 *           type: number
 *         productVariantWeight:
 *           type: number
 *         productVariantColor:
 *           type: string
 *         productVariantSize:
 *           type: string
 *       example:
 *         productVariantId: 12
 *         productVariantName: "Hitam - M"
 *         productVariantPrice: 160000
 *         productVariantSellPrice: 152000
 *         productVariantStock: 25
 *         productVariantDiscount: 5
 *     ProductCreateRequest:
 *       type: object
 *       required:
 *         - productName
 *         - productCategoryId
 *         - productSubCategoryId
 *         - productCode
 *       properties:
 *         productName:
 *           type: string
 *         productDescription:
 *           type: string
 *         productCategoryId:
 *           type: integer
 *         productSubCategoryId:
 *           type: integer
 *         productCode:
 *           type: string
 *         productBarcode:
 *           type: string
 *         productUnit:
 *           type: string
 *         productIsVisible:
 *           type: boolean
 *         productVariants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductVariantCreate'
 *       example:
 *         productName: "Kaos Oversize Premium"
 *         productDescription: "Kaos cotton combed 24s."
 *         productCategoryId: 1
 *         productSubCategoryId: 10
 *         productCode: "TSHIRT-OVS-001"
 *         productBarcode: "8991234567890"
 *         productUnit: "pcs"
 *         productIsVisible: true
 *         productVariants:
 *           - productVariantName: "Hitam - M"
 *             productVariantImage: "https://cdn.example.com/products/variant-black-m.jpg"
 *             productVariantPrice: 150000
 *             productVariantSellPrice: 135000
 *             productVariantStock: 30
 *             productVariantDiscount: 10
 *             productVariantWeight: 250
 *             productVariantColor: "Black"
 *             productVariantSize: "M"
 *     ProductUpdateRequest:
 *       type: object
 *       required:
 *         - productId
 *       properties:
 *         productId:
 *           type: integer
 *         productName:
 *           type: string
 *         productDescription:
 *           type: string
 *         productCategoryId:
 *           type: integer
 *         productSubCategoryId:
 *           type: integer
 *         productCode:
 *           type: string
 *         productBarcode:
 *           type: string
 *         productUnit:
 *           type: string
 *         productIsVisible:
 *           type: boolean
 *         productVariants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductVariantUpdate'
 *       example:
 *         productId: 123
 *         productName: "Kaos Oversize Premium V2"
 *         productDescription: "Update deskripsi produk"
 *         productCategoryId: 1
 *         productSubCategoryId: 10
 *         productCode: "TSHIRT-OVS-001-REV"
 *         productBarcode: "8991234567890"
 *         productUnit: "pcs"
 *         productIsVisible: true
 *         productVariants:
 *           - productVariantId: 12
 *             productVariantName: "Hitam - M"
 *             productVariantPrice: 160000
 *             productVariantSellPrice: 152000
 *             productVariantStock: 25
 *             productVariantDiscount: 5
 *           - productVariantName: "Putih - L"
 *             productVariantImage: "https://cdn.example.com/products/variant-white-l.jpg"
 *             productVariantPrice: 155000
 *             productVariantSellPrice: 150350
 *             productVariantStock: 12
 *             productVariantDiscount: 3
 *             productVariantWeight: 250
 *             productVariantColor: "White"
 *             productVariantSize: "L"
 *     ProductVariant:
 *       type: object
 *       properties:
 *         productVariantId:
 *           type: integer
 *         productVariantProductId:
 *           type: integer
 *         productVariantName:
 *           type: string
 *         productVariantImage:
 *           type: string
 *           nullable: true
 *         productVariantPrice:
 *           type: number
 *         productVariantDiscount:
 *           type: number
 *         productVariantSellPrice:
 *           type: number
 *         productVariantTotalSale:
 *           type: integer
 *         productVariantStock:
 *           type: integer
 *         productVariantWeight:
 *           type: number
 *         productVariantColor:
 *           type: string
 *           nullable: true
 *         productVariantSize:
 *           type: string
 *           nullable: true
 *     Product:
 *       type: object
 *       properties:
 *         productId:
 *           type: integer
 *         productName:
 *           type: string
 *         productDescription:
 *           type: string
 *         productCategoryId:
 *           type: string
 *         productSubCategoryId:
 *           type: string
 *         productCode:
 *           type: string
 *         productIsHighlight:
 *           type: boolean
 *         productBarcode:
 *           type: string
 *         productUnit:
 *           type: string
 *         productIsVisible:
 *           type: boolean
 *         productVariants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductVariant'
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
 *           default: 1
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
 *           type: integer
 *         description: Filter by product category ID
 *       - in: query
 *         name: productSubCategoryId
 *         schema:
 *           type: integer
 *         description: Filter by product sub-category ID
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Enable pagination
 *       - in: query
 *         name: productBarcode
 *         schema:
 *           type: string
 *         description: Filter by product barcode
 *     responses:
 *       200:
 *         description: List of products
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
 *           default: 1
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
 *           type: integer
 *         description: Filter by product category ID
 *       - in: query
 *         name: productSubCategoryId
 *         schema:
 *           type: integer
 *         description: Filter by product sub-category ID
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Enable pagination
 *       - in: query
 *         name: productBarcode
 *         schema:
 *           type: string
 *         description: Filter by product barcode
 *     responses:
 *       200:
 *         description: List of highlight products
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
 * /api/v1/products/barcode/{barcode}:
 *   get:
 *     summary: Get a product by barcode
 *     tags: [PRODUCTS]
 *     parameters:
 *       - name: barcode
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The barcode of the product
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
 *             $ref: '#/components/schemas/ProductCreateRequest'
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
 *             $ref: '#/components/schemas/ProductUpdateRequest'
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
 *         description: Invalid input data
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/products:
 *   delete:
 *     summary: Delete a product by query productId
 *     tags: [PRODUCTS]
 *     parameters:
 *       - name: productId
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
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
