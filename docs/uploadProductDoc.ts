/**
 * @swagger
 * tags:
 *   name: PRODUCT UPLOAD
 *   description: Product bulk upload management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FileUpload:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         fileName:
 *           type: string
 *           example: "products_2025.xlsx"
 *         filePath:
 *           type: string
 *           example: "uploads/products_2025.xlsx"
 *         status:
 *           type: string
 *           enum: [PENDING, PROCESSING, COMPLETED, FAILED]
 *           example: "PROCESSING"
 *         message:
 *           type: string
 *           example: "Processing completed successfully"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-02T08:20:30Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-02T09:00:00Z"
 */

/**
 * @swagger
 * /api/v1/products/upload-excel:
 *   post:
 *     summary: Upload Excel file for bulk product creation
 *     description: Upload an Excel file containing product data. The file will be processed in the background using a worker. The API immediately returns a file ID and status while processing continues asynchronously.
 *     tags: [PRODUCT UPLOAD]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file (.xlsx or .xls) containing product data
 *     responses:
 *       202:
 *         description: File uploaded successfully and queued for background processing
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
 *                   example: File uploaded and queued for processing
 *                 fileId:
 *                   type: integer
 *                   example: 5
 *       400:
 *         description: Invalid file upload request
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/products/upload-status/{fileId}:
 *   get:
 *     summary: Get upload status of a product Excel file
 *     description: Check the current processing status of a previously uploaded Excel file by file ID.
 *     tags: [PRODUCT UPLOAD]
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the uploaded file
 *     responses:
 *       200:
 *         description: Upload status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FileUpload'
 *       404:
 *         description: File upload record not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/products/upload-history:
 *   get:
 *     summary: Get list of uploaded product Excel files
 *     description: Retrieve all uploaded Excel files and their current processing status.
 *     tags: [PRODUCT UPLOAD]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESSING, SUCCESS, FAILED]
 *         description: Filter uploads by status
 *     responses:
 *       200:
 *         description: List of uploaded files
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
 *                     $ref: '#/components/schemas/FileUpload'
 *       500:
 *         description: Server error
 */
