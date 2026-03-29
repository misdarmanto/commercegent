/**
 * @swagger
 * /api/v1/transactions:
 *   get:
 *     summary: Trieve transactions for the authenticated user
 *     tags: [TRANSACTIONS]
 *     security:
 *       - bearerAuth: []
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
