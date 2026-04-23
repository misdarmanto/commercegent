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
 *         - whatsappNumber
 *       properties:
 *         whatsappNumber:
 *           type: string
 *           example: "+6281234567890"
 *     Setting:
 *       type: object
 *       required:
 *         - settingId
 *         - whatsappNumber
 *       properties:
 *         settingId:
 *           type: string
 *           example: "7c6d2b2f-52f3-4b6a-9c84-3c6fa7f2e22b"
 *         whatsappNumber:
 *           type: string
 *           example: "+6281234567890"
 */

/**
 * @swagger
 * /api/v1/settings:
 *   get:
 *     summary: Get all settings
 *     tags: [SETTINGS]
 *     parameters:
 *       - in: query
 *         name: settingId
 *         schema:
 *           type: string
 *           example: "7c6d2b2f-52f3-4b6a-9c84-3c6fa7f2e22b"
 *         description: The ID of the setting to get
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
 *         description: Setting already exists
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
