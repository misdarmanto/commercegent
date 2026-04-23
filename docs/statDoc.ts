/**
 * @swagger
 * tags:
 *   name: STATS
 *   description: Stat counter APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Stat:
 *       type: object
 *       properties:
 *         statId:
 *           type: integer
 *           example: 1
 *         statTotalVisit:
 *           type: integer
 *           example: 120
 *         deleted:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 */

/**
 * @swagger
 * /api/v1/stats:
 *   get:
 *     summary: Get stat data
 *     tags: [STATS]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stat retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Stat'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
