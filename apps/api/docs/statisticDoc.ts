/**
 * @swagger
 * tags:
 *   name: STATISTICS
 *   description: Statistic and visitor APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateVisitor:
 *       type: object
 *       properties:
 *         visitorMeta:
 *           type: string
 *           example: 'Visitor meta'
 *     VisitorStat:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           example: '2026-04-23'
 *         total:
 *           type: integer
 *           example: 22
 */

/**
 * @swagger
 * /api/v1/statistic/total:
 *   get:
 *     summary: Get dashboard total statistic
 *     tags: [STATISTICS]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistic retrieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/statistic/visitor:
 *   get:
 *     summary: Get visitor chart data by range
 *     tags: [STATISTICS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: range
 *         required: false
 *         schema:
 *           type: string
 *           enum: [1d, 7d, 1m, 3m, 1y]
 *           default: 1d
 *         description: Range waktu untuk agregasi visitor
 *       - in: query
 *         name: interval
 *         required: false
 *         schema:
 *           type: string
 *           enum: [1h, 12h, 1d]
 *           default: 1h
 *         description: Interval waktu per bucket data visitor
 *     responses:
 *       200:
 *         description: Visitor chart retrieved
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
 *                     $ref: '#/components/schemas/VisitorStat'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create or increase visitor counter
 *     tags: [STATISTICS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVisitor'
 *           example:
 *             visitorMeta: 'Visitor meta'
 *     responses:
 *       201:
 *         description: Visitor counter updated successfully
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
 *                   example: Visitor created successfully
 *                 data:
 *                   $ref: '#/components/schemas/VisitorStat'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
