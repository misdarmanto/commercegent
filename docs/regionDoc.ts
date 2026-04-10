/**
 * @swagger
 * tags:
 *   name: REGIONS
 *   description: Region management APIs
 */

/**
 * @swagger
 * /api/v1/regions/provinces:
 *   get:
 *     summary: Get all provinces
 *     tags: [REGIONS]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of provinces
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/regions/regencies/{provinceId}:
 *   get:
 *     summary: Get regencies by province ID
 *     tags: [REGIONS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: provinceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Province ID
 *     responses:
 *       200:
 *         description: List of regencies
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/regions/districts/{regencyId}:
 *   get:
 *     summary: Get districts by regency ID
 *     tags: [REGIONS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: regencyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Regency ID
 *     responses:
 *       200:
 *         description: List of districts
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/regions/villages/{districtId}:
 *   get:
 *     summary: Get villages by district ID
 *     tags: [REGIONS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: districtId
 *         required: true
 *         schema:
 *           type: string
 *         description: District ID
 *     responses:
 *       200:
 *         description: List of villages
 *       500:
 *         description: Server error
 */
