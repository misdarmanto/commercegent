/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users
 *     tags: [USERS]
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
 *         description: Search by name, email, or partner code
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
 * /api/v1/users/detail:
 *   get:
 *     summary: Get user detail by userId
 *     tags: [USERS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the user
 *     responses:
 *       200:
 *         description: User found
 *       400:
 *         description: Missing or invalid userId
 *       403:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/users:
 *   delete:
 *     summary: Soft delete a user
 *     tags: [USERS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User successfully marked as deleted
 *       400:
 *         description: Missing userId parameter
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/users:
 *   patch:
 *     summary: Update user data
 *     tags: [USERS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               userEmail:
 *                 type: string
 *                 format: email
 *               userPassword:
 *                 type: string
 *               userWhatsAppNumber:
 *                 type: string
 *               userPhoto:
 *                 type: string
 *                 format: uri
 *               userRole:
 *                 type: string
 *                 enum: [user, admin, superAdmin]
 *               userGender:
 *                 type: string
 *                 enum: [pria, wanita]
 *               userCoin:
 *                 type: number
 *               userFcmId:
 *                 type: string
 *               userPartnerCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/v1/users/update-password:
 *   patch:
 *     summary: Update user password
 *     tags: [USERS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userPassword
 *             properties:
 *               userPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Validation error
 */
