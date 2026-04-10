/**
 * @swagger
 * /api/v1/shipping/rates:
 *   post:
 *     tags: [SHIPPING]
 *     summary: Hitung ongkos kirim
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             minItems: 1
 *             items:
 *               type: object
 *               required:
 *                 - productId
 *                 - quantity
 *               properties:
 *                 productId:
 *                   type: integer
 *                   example: 1
 *                 quantity:
 *                   type: integer
 *                   example: 2
 *                   minimum: 1
 *     responses:
 *       200:
 *         description: Success get shipping rates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Product or address not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/shipping/draft:
 *   post:
 *     summary: Buat draft order dari order yang sudah ada
 *     tags: [SHIPPING]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: number
 *                 example: 123
 *
 *     responses:
 *       201:
 *         description: Draft order created
 *       400:
 *         description: Invalid request or order state
 *       404:
 *         description: Order or address not found
 *       409:
 *         description: Draft already exists
 *       502:
 *         description: Biteship error
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/shipping/draft/confirm:
 *   post:
 *     summary: Konfirmasi draft order (buat shipment)
 *     tags: [SHIPPING]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: number
 *                 example: 123
 *     responses:
 *       200:
 *         description: Draft order confirmed
 *       400:
 *         description: Invalid order state
 *       404:
 *         description: Order not found
 *       502:
 *         description: Biteship error
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/shipping/tracking:
 *   get:
 *     summary: Track shipment berdasarkan ID order
 *     tags: [SHIPPING]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: orderId
 *         required: true
 *         schema:
 *           type: number
 *         example: 123
 *     responses:
 *       200:
 *         description: Tracking data retrieved successfully
 *       400:
 *         description: Shipment data not available
 *       404:
 *         description: Order not found
 *       502:
 *         description: Biteship service error
 *       500:
 *         description: Server error
 */
