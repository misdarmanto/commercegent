/**
 * @swagger
 * /api/v1/promotions:
 *   get:
 *     summary: Get all promotion
 *     tags: [PROMOTIONS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
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
 *       - in: query
 *         name: productCategoryId
 *         schema:
 *           type: string
 *         description: Filter by product category ID
 *       - in: query
 *         name: productSubCategoryId
 *         schema:
 *           type: string
 *         description: Filter by product sub-category ID
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
