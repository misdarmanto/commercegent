/**
 * @swagger
 * tags:
 *   name: BANNERS
 *   description: Banner management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateBanner:
 *       type: object
 *       required:
 *         - bannerImage
 *       properties:
 *         bannerImage:
 *           type: string
 *           example: "Electronics"
 *         bannerOrder:
 *           type: string
 *         bannerOrder:
 *           type: string
 *           example: "https://example.com/icons/electronics.png"
 *     Banner:
 *       type: object
 *       required:
 *         - bannerId
 *         - bannerImage
 *       properties:
 *         bannerId:
 *           type: number
 *           example: 1
 *         bannerImage:
 *          type: string
 *         bannerOrder:
 *           type: number
 *           example: 1
 */

/**
 * @swagger
 * /api/v1/banners:
 *   get:
 *     summary: Get all banners
 *     tags: [BANNERS]
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
 *         description: Search by banner image
 *       - in: query
 *         name: bannerOrder
 *         schema:
 *           type: string
 *         description: Filter by banner order
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Enable pagination
 *     responses:
 *       200:
 *         description: List of banners
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Banner'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/banners/detail/{bannerId}:
 *   get:
 *     summary: Get a banner by id
 *     tags: [BANNERS]
 *     parameters:
 *       - name: bannerId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the banner
 *     responses:
 *       200:
 *         description: Banner retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Banner'
 *       404:
 *         description: Banner not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/banners:
 *   post:
 *     summary: Create a new banner
 *     tags: [BANNERS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBanner'
 *     responses:
 *       201:
 *         description: Banner created successfully
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
 *                   example: Banner created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Banner'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/banners/{bannerId}:
 *   delete:
 *     summary: Delete a banner by id
 *     tags: [BANNERS]
 *     parameters:
 *       - name: bannerId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The id of the banner to delete
 *     responses:
 *       200:
 *         description: Banner deleted successfully
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
 *                   example: Banner deleted successfully
 *       404:
 *         description: Banner not found
 *       500:
 *         description: Server error
 */
