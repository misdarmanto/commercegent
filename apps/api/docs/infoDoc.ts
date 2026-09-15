/**
 * @swagger
 * /api/v1/:
 *   get:
 *     summary: Welcome message
 *     tags: [INFO]
 *     responses:
 *       200:
 *         description: Welcome message returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     about_me:
 *                       type: string
 *                       example: Welcome to ECOMMERCE API V1

 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check
 *     tags: [INFO]
 *     responses:
 *       200:
 *         description: API is up and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: ok
 *                     uptime:
 *                       type: number
 *                       example: 123.45
 *       500:
 *         description: Health check failed
 */
