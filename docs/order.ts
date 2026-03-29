/**
 * @swagger
 * tags:
 *   name: ORDERS
 *   description: Order management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateOrderItem:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         productId:
 *           type: integer
 *           example: 1
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *
 *     CreateOrder:
 *       type: object
 *       required:
 *         - items
 *         - orderShippingFee
 *         - orderCourierCompany
 *         - orderCourierType
 *       properties:
 *         orderShippingFee:
 *           type: number
 *           example: 15000
 *         orderCourierCompany:
 *           type: string
 *           example: jne
 *         orderCourierType:
 *           type: string
 *           example: delivery
 *         items:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/CreateOrderItem'
 *
 *     OrderItem:
 *       type: object
 *       properties:
 *         orderItemId:
 *           type: number
 *           example: 1
 *         productId:
 *           type: string
 *           example: "12"
 *         productNameSnapshot:
 *           type: string
 *           example: Wireless Mouse
 *         productPriceSnapshot:
 *           type: number
 *           example: 35000
 *         quantity:
 *           type: integer
 *           example: 2
 *         totalPrice:
 *           type: number
 *           example: 70000
 *
 *     Order:
 *       type: object
 *       properties:
 *         orderId:
 *           type: number
 *           example: 101
 *         orderUserId:
 *           type: string
 *           example: "USR-001"
 *         orderSubtotal:
 *           type: number
 *           example: 70000
 *         orderShippingFee:
 *           type: number
 *           example: 15000
 *         orderGrandTotal:
 *           type: number
 *           example: 85000
 *         orderTotalItem:
 *           type: integer
 *           example: 2
 *         orderCourierCode:
 *           type: string
 *           example: jne
 *         orderCourierService:
 *           type: string
 *           example: REG
 *         orderStatus:
 *           type: string
 *           example: waiting
 *         orderItems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create new order
 *     tags: [ORDERS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrder'
 *     responses:
 *       201:
 *         description: Order created successfully
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
 *                   properties:
 *                     orderId:
 *                       type: number
 *                       example: 123
 *                     snapToken:
 *                       type: string
 *                       example: snap-token-midtrans
 *                     redirectUrl:
 *                       type: string
 *                       example: https://app.midtrans.com/snap/v2/vtweb/xxxx
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Product or address not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get list of orders
 *     tags: [ORDERS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: orderStatus
 *         schema:
 *           type: string
 *           enum: [waiting, process, delivery, done, cancel]
 *     responses:
 *       200:
 *         description: List of orders
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
 *                   properties:
 *                     totalItems:
 *                       type: number
 *                       example: 10
 *                     totalPages:
 *                       type: number
 *                       example: 1
 *                     currentPage:
 *                       type: number
 *                       example: 0
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/orders/detail/{orderId}:
 *   get:
 *     summary: Get order detail
 *     tags: [ORDERS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Order detail retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
