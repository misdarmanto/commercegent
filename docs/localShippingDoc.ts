/**
 * @swagger
 * tags:
 *   name: LOCAL SHIPPINGS
 *   description: Local shipping (shipping price per kg) management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LocalShipping:
 *       type: object
 *       properties:
 *         localShippingId:
 *           type: integer
 *           example: 1
 *         localShippingCompanyName:
 *           type: string
 *           example: "Jawa Barat"
 *         localShippingProvinceId:
 *           type: string
 *           example: "1"
 *         localShippingPricePerKg:
 *           type: integer
 *           example: 15000
 *         localShippingDuration:
 *           type: string
 *           example: "1 day"
 *         deleted:
 *           type: boolean
 *           example: false
 *     CreateLocalShipping:
 *       type: object
 *       required:
 *         - localShippingCompanyName
 *         - localShippingProvinceName
 *         - localShippingProvinceId
 *         - localShippingKabupatenName
 *         - localShippingKabupatenId
 *         - localShippingPricePerKg
 *         - localShippingDuration
 *       properties:
 *         localShippingCompanyName:
 *           type: string
 *           minLength: 2
 *           maxLength: 120
 *           example: "Jawa Barat"
 *         localShippingProvinceName:
 *           type: string
 *           minLength: 2
 *           maxLength: 120
 *           example: "Jawa Tengah"
 *         localShippingProvinceId:
 *           type: string
 *           example: "1"
 *         localShippingKabupatenName:
 *           type: string
 *           minLength: 2
 *           maxLength: 120
 *           example: "Kota Bandung"
 *         localShippingKabupatenId:
 *           type: string
 *           example: "1"
 *         localShippingPricePerKg:
 *           type: integer
 *           minimum: 0
 *           example: 12000
 *         localShippingDuration:
 *           type: string
 *           example: "1 day"
 *     UpdatelocalShipping:
 *       type: object
 *       required:
 *         - localShippingId
 *       properties:
 *         localShippingId:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *         localShippingCompanyName:
 *           type: string
 *           minLength: 2
 *           maxLength: 120
 *           example: "Jawa Barat"
 *         localShippingProvinceName:
 *           type: string
 *           minLength: 2
 *           maxLength: 120
 *           example: "Jawa Tengah"
 *         localShippingKabupatenName:
 *           type: string
 *           minLength: 2
 *           maxLength: 120
 *           example: "Kota Bandung"
 *         localShippingKabupatenId:
 *           type: string
 *           example: "1"
 *         localShippingPricePerKg:
 *           type: integer
 *           minimum: 0
 *           example: 15000
 *         localShippingDuration:
 *           type: string
 *           example: "1 day"
 */

/**
 * @swagger
 * /api/v1/local-shippings:
 *   get:
 *     summary: Get all localShipping
 *     tags: [LOCAL SHIPPINGS]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search province name
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Enable pagination
 *     responses:
 *       200:
 *         description: List of localShipping
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
 *                     totalItems:
 *                       type: integer
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LocalShipping'
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create localShipping
 *     tags: [LOCAL SHIPPINGS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLocalShipping'
 *     responses:
 *       201:
 *         description: localShipping created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin/superAdmin only)
 *       500:
 *         description: Server error
 *   patch:
 *     summary: Update localShipping
 *     tags: [LOCAL SHIPPINGS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatelocalShipping'
 *     responses:
 *       200:
 *         description: localShipping updated successfully
 *       400:
 *         description: Validation error or empty update payload
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin/superAdmin only)
 *       404:
 *         description: localShipping not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/local-shippings/{localShippingId}:
 *   get:
 *     summary: Get localShipping detail by ID
 *     tags: [LOCAL SHIPPINGS]
 *     parameters:
 *       - in: path
 *         name: localShippingId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: localShipping detail
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/LocalShipping'
 *       404:
 *         description: localShipping not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Remove localShipping (soft delete)
 *     tags: [LOCAL SHIPPINGS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: localShippingId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: localShipping removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin/superAdmin only)
 *       404:
 *         description: localShipping not found
 *       500:
 *         description: Server error
 */
