/**
 * @swagger
 * /api/v1/auth/users/login:
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
 *                 example: "6281234567890"
 *               userPassword:
 *                 type: string
 *                 example: "qwerty"
 *     responses:
 *       201:
 *         description: Login successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/v1/auth/users/register:
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
 *                 example: "John Doe User"
 *               userPassword:
 *                 type: string
 *                 example: "qwerty"
 *               userWhatsAppNumber:
 *                 type: string
 *                 example: "6281234567890"
 *               userGender:
 *                 type: string
 *                 enum: [pria, wanita]
 *                 example: "pria"
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
 * /api/v1/auth/admins/login:
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
 *               - adminWhatsAppNumber
 *               - adminPassword
 *             properties:
 *               adminWhatsAppNumber:
 *                 type: string
 *                 example: "628123456789"
 *               adminPassword:
 *                 type: string
 *                 example: "qwerty"
 *     responses:
 *       201:
 *         description: Login successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/v1/auth/admins/register:
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
 *               - adminName
 *               - adminPassword
 *               - adminWhatsAppNumber
 *             properties:
 *               adminName:
 *                 type: string
 *                 example: "John Doe"
 *               adminPassword:
 *                 type: string
 *                 example: "qwerty"
 *               adminWhatsAppNumber:
 *                 type: string
 *                 example: "628123456789"
 *               adminRole:
 *                 type: string
 *                 enum: [user, admin, superAdmin]
 *                 example: "admin"
 *               adminFcmId:
 *                 type: string
 *                 example: "1234567890"
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       400:
 *         description: Validation error or duplicate admin
 *       500:
 *         description: Server error
 */
