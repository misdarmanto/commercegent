/**
 * @swagger
 * tags:
 *   name: WEBHOOK
 *   description: Payment gateway webhook (Midtrans)
 */

/**
 * @swagger
 * /api/v1/webhooks/midtrans:
 *   post:
 *     summary: Midtrans payment notification webhook
 *     tags: [WEBHOOK]
 *     description: |
 *       Endpoint ini digunakan oleh Midtrans untuk mengirimkan notifikasi status transaksi.
 *       Endpoint ini akan:
 *       - Mengupdate status order
 *       - Membuat data baru di table transactions
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *               - transaction_status
 *               - gross_amount
 *             properties:
 *               order_id:
 *                 type: string
 *                 example: "123"
 *               transaction_status:
 *                 type: string
 *                 enum:
 *                   - pending
 *                   - settlement
 *                   - capture
 *                   - deny
 *                   - cancel
 *                   - expire
 *                   - failure
 *                 example: settlement
 *               payment_type:
 *                 type: string
 *                 example: bank_transfer
 *               gross_amount:
 *                 type: string
 *                 example: "125000"
 *               fraud_status:
 *                 type: string
 *                 example: accept
 *               transaction_id:
 *                 type: string
 *                 example: "bca-transaction-123"
 *               status_code:
 *                 type: string
 *                 example: "200"
 *               signature_key:
 *                 type: string
 *                 example: "generated-signature-from-midtrans"
 *
 *     responses:
 *       200:
 *         description: Webhook processed successfully
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
 *                   example: Webhook processed
 *
 *       400:
 *         description: Invalid payload
 *
 *       404:
 *         description: Order not found
 *
 *       500:
 *         description: Server error
 */
