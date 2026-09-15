/**
 * @swagger
 * tags:
 *   name: ADDRESSES
 *   description: Address management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateAddress:
 *       type: object
 *       required:
 *         - addressUserName
 *         - addressKontak
 *         - addressDetail
 *         - addressPostalCode
 *         - addressProvinsiId
 *         - addressProvinsiName
 *         - addressKabupatenId
 *         - addressKabupatenName
 *         - addressKecamatanId
 *         - addressKecamatanName
 *         - addressDesaId
 *         - addressDesaName
 *         - addressLongitude
 *         - addressLatitude
 *       properties:
 *         addressUserName:
 *           type: string
 *           example: "John Doe"
 *         addressKontak:
 *           type: string
 *           example: "+628123456789"
 *         addressDetail:
 *           type: string
 *           example: "Jl. Melati No. 45, Blok C"
 *         addressPostalCode:
 *           type: string
 *           example: "40234"
 *         addressProvinsiId:
 *           type: string
 *           example: "32"
 *         addressProvinsiName:
 *           type: string
 *           example: "Jawa Barat"
 *         addressKabupatenId:
 *           type: string
 *           example: "3273"
 *         addressKabupatenName:
 *           type: string
 *           example: "Kota Bandung"
 *         addressKecamatanId:
 *           type: string
 *           example: "3273010"
 *         addressKecamatanName:
 *           type: string
 *           example: "Coblong"
 *         addressDesaId:
 *           type: string
 *           example: "3273010001"
 *         addressDesaName:
 *           type: string
 *           example: "Dago"
 *         addressLongitude:
 *           type: string
 *           example: "107.617096"
 *         addressLatitude:
 *           type: string
 *           example: "-6.917464"
 *     UpdateAddress:
 *       type: object
 *       required:
 *         - addressId
 *       properties:
 *         addressId:
 *           type: integer
 *           minimum: 1
 *         addressUserName:
 *           type: string
 *         addressKontak:
 *           type: string
 *         addressDetail:
 *           type: string
 *         addressPostalCode:
 *           type: string
 *         addressProvinsiId:
 *           type: string
 *         addressProvinsiName:
 *           type: string
 *         addressKabupatenId:
 *           type: string
 *         addressKabupatenName:
 *           type: string
 *         addressKecamatanId:
 *           type: string
 *         addressKecamatanName:
 *           type: string
 *         addressDesaId:
 *           type: string
 *         addressDesaName:
 *           type: string
 *         addressLongitude:
 *           type: string
 *         addressLatitude:
 *           type: string
 *     UpdateAddressType:
 *       type: object
 *       required:
 *         - addressId
 *       properties:
 *         addressId:
 *           type: integer
 *           minimum: 1
 *     Address:
 *       type: object
 *       properties:
 *         addressId:
 *           type: integer
 *         addressUserId:
 *           type: integer
 *         addressUserName:
 *           type: string
 *         addressKontak:
 *           type: string
 *         addressDetail:
 *           type: string
 *         addressPostalCode:
 *           type: string
 *         addressProvinsiId:
 *           type: string
 *         addressProvinsiName:
 *           type: string
 *         addressKabupatenId:
 *           type: string
 *         addressKabupatenName:
 *           type: string
 *         addressKecamatanId:
 *           type: string
 *         addressKecamatanName:
 *           type: string
 *         addressDesaId:
 *           type: string
 *         addressDesaName:
 *           type: string
 *         addressCategory:
 *           type: string
 *           enum: [user, admin]
 *         addressType:
 *           type: string
 *           enum: [main, secondary]
 *         addressLongitude:
 *           type: string
 *         addressLatitude:
 *           type: string
 *         deleted:
 *           type: boolean
 */

/**
 * @swagger
 * /api/v1/addresses/users:
 *   get:
 *     summary: Get all user addresses
 *     tags: [ADDRESSES]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
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
 *         description: Optional search keyword
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Enable pagination
 *       - in: query
 *         name: addressCategory
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *         description: Optional category filter
 *       - in: query
 *         name: addressType
 *         schema:
 *           type: string
 *           enum: [main, secondary]
 *         description: Optional type filter
 *     responses:
 *       200:
 *         description: User addresses retrieved successfully
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
 *                       type: integer
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Address'
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/addresses/admins:
 *   get:
 *     summary: Get admin address
 *     tags: [ADDRESSES]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Page size
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Optional search keyword
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Enable pagination
 *       - in: query
 *         name: addressCategory
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *         description: Optional category filter
 *       - in: query
 *         name: addressType
 *         schema:
 *           type: string
 *           enum: [main, secondary]
 *         description: Optional type filter
 *     responses:
 *       200:
 *         description: Address retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (requires admin/superAdmin)
 *       404:
 *         description: Address not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/addresses/users:
 *   post:
 *     summary: Create user address
 *     tags: [ADDRESSES]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAddress'
 *     responses:
 *       201:
 *         description: Address created successfully
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
 *                   example: Address created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/addresses/admins:
 *   post:
 *     summary: Create or update admin address
 *     tags: [ADDRESSES]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAddress'
 *     responses:
 *       201:
 *         description: Address created successfully
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
 *                   example: Address created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (requires admin/superAdmin)
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/addresses:
 *   patch:
 *     summary: Update an address
 *     tags: [ADDRESSES]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAddress'
 *     responses:
 *       200:
 *         description: Address updated successfully
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
 *                   example: Address updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/addresses/{addressId}:
 *   delete:
 *     summary: Delete an address by id
 *     tags: [ADDRESSES]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: addressId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: The id of the address to delete
 *     responses:
 *       200:
 *         description: Address deleted successfully
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
 *                   example: Address deleted successfully
 *       404:
 *         description: Address not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/addresses/to-main:
 *   patch:
 *     summary: Set one user address as main
 *     tags: [ADDRESSES]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAddressType'
 *     responses:
 *       200:
 *         description: Address set to main successfully
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
 *                   example: Address set to main successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 *       500:
 *         description: Server error
 */
