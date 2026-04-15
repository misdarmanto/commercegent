/**
 * @swagger
 * tags:
 *   name: SETTINGS
 *   description: Application setting management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateSetting:
 *       type: object
 *       required:
 *         - settingType
 *       properties:
 *         settingType:
 *           type: string
 *           enum: [bank, qris, general, wa_blas]
 *           example: "bank"
 *         bankName:
 *           type: string
 *           example: "Bank Central Asia"
 *         bankNumber:
 *           type: string
 *           example: "1234567890"
 *         bankOwner:
 *           type: string
 *           example: "John Doe"
 *         qris:
 *           type: string
 *           example: "https://example.com/qris.png"
 *         banner:
 *           type: string
 *           example: "https://example.com/banner.jpg"
 *         whatsappNumber:
 *           type: string
 *           example: "+6281234567890"
 *         waBlasToken:
 *           type: string
 *           example: "YOUR_WA_BLAS_TOKEN"
 *         waBlasServer:
 *           type: string
 *           example: "https://wablas.com/api/send"
 *
 *     Setting:
 *       type: object
 *       required:
 *         - settingId
 *         - settingType
 *       properties:
 *         settingId:
 *           type: string
 *           example: "7c6d2b2f-52f3-4b6a-9c84-3c6fa7f2e22b"
 *         settingType:
 *           type: string
 *           enum: [bank, qris, general, wa_blas]
 *           example: "general"
 *         bankName:
 *           type: string
 *           example: "Bank Central Asia"
 *         bankNumber:
 *           type: string
 *           example: "1234567890"
 *         bankOwner:
 *           type: string
 *           example: "John Doe"
 *         qris:
 *           type: string
 *           example: "https://example.com/qris.png"
 *         banner:
 *           type: string
 *           example: "https://example.com/banner.jpg"
 *         whatsappNumber:
 *           type: string
 *           example: "+6281234567890"
 *         waBlasToken:
 *           type: string
 *           example: "YOUR_WA_BLAS_TOKEN"
 *         waBlasServer:
 *           type: string
 *           example: "https://wablas.com/api/send"
 */

/**
 * @swagger
 * /api/v1/settings:
 *   get:
 *     summary: Get all settings (optionally filter by settingType)
 *     tags: [SETTINGS]
 *     parameters:
 *       - in: query
 *         name: settingType
 *         schema:
 *           type: string
 *           enum: [bank, qris, general, wa_blas]
 *         description: Filter settings by type
 *     responses:
 *       200:
 *         description: List of settings
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
 *                     $ref: '#/components/schemas/Setting'
 *       404:
 *         description: No settings found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/settings/detail/{settingId}:
 *   get:
 *     summary: Get a setting by ID
 *     tags: [SETTINGS]
 *     parameters:
 *       - name: settingId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the setting
 *     responses:
 *       200:
 *         description: Setting retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Setting'
 *       404:
 *         description: Setting not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/settings:
 *   post:
 *     summary: Create a new setting
 *     tags: [SETTINGS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSetting'
 *     responses:
 *       201:
 *         description: Setting created successfully
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
 *                   example: Setting created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Setting'
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Setting already exists (for unique types)
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/settings:
 *   patch:
 *     summary: Update an existing setting
 *     tags: [SETTINGS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Setting'
 *     responses:
 *       200:
 *         description: Setting updated successfully
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
 *                   example: Setting updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Setting'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Setting not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/settings/{settingId}:
 *   delete:
 *     summary: Delete a setting by ID
 *     tags: [SETTINGS]
 *     parameters:
 *       - name: settingId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the setting to delete
 *     responses:
 *       200:
 *         description: Setting deleted successfully
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
 *                   example: Setting deleted successfully
 *       404:
 *         description: Setting not found
 *       500:
 *         description: Server error
 */
