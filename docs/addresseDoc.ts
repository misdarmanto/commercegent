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
 *         - addressProvinsi
 *         - addressKabupaten
 *         - addressKecamatan
 *         - addressDesa
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
 *         addressProvinsi:
 *           type: string
 *           example: "Jawa Barat"
 *         addressKabupaten:
 *           type: string
 *           example: "Bandung"
 *         addressKecamatan:
 *           type: string
 *           example: "Coblong"
 *         addressDesa:
 *           type: string
 *           example: "Desa"
 *         addressLongitude:
 *           type: string
 *           example: "34324"
 *         addressLatitude:
 *           type: string
 *           example: "42343"
 *     Address:
 *       type: object
 *       required:
 *         - addressId
 *         - addressUserId
 *         - addressUserName
 *         - addressKontak
 *         - addressDetail
 *         - addressPostalCode
 *         - addressProvinsi
 *         - addressKabupaten
 *         - addressKecamatan
 *         - addressDesa
 *         - addressCategory
 *         - addressLongitude
 *         - addressLatitude
 *       properties:
 *         addressId:
 *           type: string
 *           example: "addr_001"
 *         addressUserId:
 *           type: string
 *           example: "usr_12345"
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
 *         addressProvinsi:
 *           type: string
 *           example: "Jawa Barat"
 *         addressKabupaten:
 *           type: string
 *           example: "Bandung"
 *         addressKecamatan:
 *           type: string
 *           example: "Coblong"
 *         addressDesa:
 *           type: string
 *           example: "42343"
 *         addressCategory:
 *           type: string
 *           enum: [user, admin]
 *           example: "user"
 *         addressLongitude:
 *           type: string
 *           example: "34324"
 *         addressLatitude:
 *           type: string
 *           example: "42343"
 *     UpdateAddress:
 *       type: object
 *       required:
 *         - addressId
 *         - addressUserName
 *         - addressKontak
 *         - addressDetail
 *         - addressPostalCode
 *         - addressProvinsi
 *         - addressKabupaten
 *         - addressKecamatan
 *         - addressDesa
 *         - addressLongitude
 *         - addressLatitude
 *       properties:
 *         addressId:
 *           type: string
 *           example: "addr_001"
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
 *         addressProvinsi:
 *           type: string
 *           example: "Jawa Barat"
 *         addressKabupaten:
 *           type: string
 *           example: "Bandung"
 *         addressKecamatan:
 *           type: string
 *           example: "Coblong"
 *         addressDesa:
 *           type: string
 *           example: "Desa"
 *         addressLongitude:
 *           type: string
 *           example: "34324"
 *         addressLatitude:
 *           type: string
 *           example: "42343"
 */

/**
 * @swagger
 * /api/v1/addresses/users:
 *   get:
 *     summary: Get all addresses
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
 *         description: Search by username or address detail
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Enable pagination
 *     responses:
 *       200:
 *         description: List of addresses
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
 *                     $ref: '#/components/schemas/Address'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/addresses/admins:
 *   get:
 *     summary: Get admin address
 *     tags: [ADDRESSES]
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
 *       404:
 *         description: Address not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/addresses/users:
 *   post:
 *     summary: Create a new address
 *     tags: [ADDRESSES]
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
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/addresses/admins:
 *   post:
 *     summary: Create a new address
 *     tags: [ADDRESSES]
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
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/addresses:
 *   patch:
 *     summary: Update an address
 *     tags: [ADDRESSES]
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
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/addresses/{addressId}:
 *   delete:
 *     summary: Delete an address by id
 *     tags: [ADDRESSES]
 *     parameters:
 *       - name: addressId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
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
 *       500:
 *         description: Server error
 */
