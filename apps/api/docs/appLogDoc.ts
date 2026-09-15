/**
 * @swagger
 * tags:
 *   name: APP_LOGS
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateAppLog:
 *       type: object
 *       required:
 *         - appLogLevel
 *         - appLogMessage
 *       description: Body createAppLogSchema
 *       properties:
 *         appLogLevel:
 *           type: string
 *           enum: [error, warn, info]
 *           example: "error"
 *         appLogMessage:
 *           type: string
 *           minLength: 1
 *           example: "Payment gateway timeout"
 *         appLogSource:
 *           type: string
 *           maxLength: 255
 *           nullable: true
 *           description: Opsional; string kosong dinormalisasi menjadi null
 *           example: "OrderService"
 *
 *     AppLog:
 *       type: object
 *       description: Baris log (model app_logs + field dasar)
 *       properties:
 *         appLogId:
 *           type: integer
 *         appLogLevel:
 *           type: string
 *           enum: [error, warn, info]
 *         appLogMessage:
 *           type: string
 *         appLogSource:
 *           type: string
 *           nullable: true
 *         appLogMeta:
 *           type: string
 *           nullable: true
 *         deleted:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 */

/**
 * @swagger
 * /api/v1/app-logs:
 *   post:
 *     summary: Buat entri app log
 *     tags: [APP_LOGS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAppLog'
 *     responses:
 *       201:
 *         description: Log tersimpan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "App log created successfully"
 *       400:
 *         description: Validasi body gagal (Zod)
 *       401:
 *         description: Tidak terautentikasi
 *       500:
 *         description: Gagal membuat log
 *   get:
 *     summary: Daftar app log
 *     tags: [APP_LOGS]
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
 *         name: level
 *         schema:
 *           type: string
 *           enum: [error, warn, info]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Set `true` untuk mengaktifkan limit/offset
 *     responses:
 *       200:
 *         description: Berhasil — `data` berisi hasil format pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: Validasi query gagal
 *       401:
 *         description: Tidak terautentikasi
 *       500:
 *         description: Gagal mengambil log
 */
