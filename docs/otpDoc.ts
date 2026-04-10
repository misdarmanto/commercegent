/**
 * @swagger
 * /api/v1/users/otp/request:
 *   post:
 *     summary: Request OTP for registration or password reset
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - whatsappNumber
 *               - otpType
 *             properties:
 *               whatsappNumber:
 *                 type: string
 *                 example: "628123456789"
 *                 description: WhatsApp number with country code
 *               otpType:
 *                 type: string
 *                 enum: [register, forgotPassword]
 *                 example: register
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/users/otp/verify:
 *   post:
 *     summary: Verify the OTP code
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - whatsappNumber
 *               - otpCode
 *             properties:
 *               whatsappNumber:
 *                 type: string
 *                 example: "628123456789"
 *                 description: WhatsApp number used to request OTP
 *               otpCode:
 *                 type: string
 *                 example: "123456"
 *                 description: OTP code sent to the user
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP or WhatsApp number
 *       500:
 *         description: Server error
 */
