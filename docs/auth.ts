/**
 * @swagger
 * /api/v1/auth/user/login:
 *   post:
 *     summary: Login
 *     tags: [AUTH]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userWhatsAppNumber
 *               - userPassword
 *             properties:
 *               userWhatsAppNumber:
 *                 type: string
 *               userPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: Login successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/v1/auth/user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [AUTH]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - userPassword
 *               - userWhatsAppNumber
 *               - userGender
 *             properties:
 *               userName:
 *                 type: string
 *               userPassword:
 *                 type: string
 *                 minLength: 6
 *               userWhatsAppNumber:
 *                 type: string
 *               userGender:
 *                 type: string
 *                 enum: [pria, wanita]
 *               userPhoto:
 *                 type: string
 *                 format: uri
 *               userRole:
 *                 type: string
 *                 enum: [user, admin, superAdmin]
 *               userFcmId:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or duplicate user
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/auth/admin/login:
 *   post:
 *     summary: Login
 *     tags: [AUTH]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userWhatsAppNumber
 *               - userPassword
 *             properties:
 *               userWhatsAppNumber:
 *                 type: string
 *               userPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: Login successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/v1/auth/admin/user/register:
 *   post:
 *     summary: Register a new admin
 *     tags: [AUTH]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - userPassword
 *               - userWhatsAppNumber
 *             properties:
 *               userName:
 *                 type: string
 *               userPassword:
 *                 type: string
 *                 minLength: 6
 *               userWhatsAppNumber:
 *                 type: string
 *               userRole:
 *                 type: string
 *                 enum: [user, admin, superAdmin]
 *               userFcmId:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or duplicate user
 *       500:
 *         description: Server error
 */
