/**
 * @swagger
 * tags:
 *   name: ADMINS
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminListItem:
 *       type: object
 *       description: Ringkasan admin (sesuai attributes yang dikembalikan findAllAdmins)
 *       properties:
 *         userId:
 *           type: integer
 *           example: 2
 *         userName:
 *           type: string
 *           example: "Admin Support"
 *         userRole:
 *           type: string
 *           enum: [user, admin, superAdmin]
 *           example: "admin"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     AdminDetail:
 *       type: object
 *       description: Detail admin (sesuai findDetailAdmin)
 *       properties:
 *         userId:
 *           type: integer
 *         userName:
 *           type: string
 *         userRole:
 *           type: string
 *           enum: [user, admin, superAdmin]
 *         userWhatsAppNumber:
 *           type: string
 *           example: "6281234567890"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     SignupAdmin:
 *       type: object
 *       required:
 *         - adminName
 *         - adminPassword
 *         - adminWhatsAppNumber
 *       description: Body registrasi admin (signupAdminSchema pada route POST /register)
 *       properties:
 *         adminName:
 *           type: string
 *           example: "Admin Baru"
 *         adminPassword:
 *           type: string
 *           minLength: 6
 *           example: "secret12"
 *         adminWhatsAppNumber:
 *           type: string
 *           example: "6281234567890"
 *     AdminCreateFull:
 *       type: object
 *       required:
 *         - adminName
 *         - adminEmail
 *         - adminPassword
 *         - adminWhatsAppNumber
 *         - adminRole
 *       description: Bentuk lengkap adminSchema (AdminSchema) — dipakai AdminService.createAdmin setelah data tervalidasi
 *       properties:
 *         adminName:
 *           type: string
 *         adminEmail:
 *           type: string
 *           format: email
 *         adminPassword:
 *           type: string
 *           minLength: 6
 *         adminWhatsAppNumber:
 *           type: string
 *         adminPhoto:
 *           type: string
 *           description: URL foto atau string kosong
 *           example: "https://example.com/photo.jpg"
 *         adminRole:
 *           type: string
 *           enum: [user, admin, superAdmin]
 *           example: "admin"
 *     UpdateAdmin:
 *       type: object
 *       description: Semua field opsional (updateAdminSchema). Minimal satu field harus dikirim; jika kosong service mengembalikan error.
 *       properties:
 *         adminName:
 *           type: string
 *         adminEmail:
 *           type: string
 *           format: email
 *         adminPassword:
 *           type: string
 *           minLength: 6
 *         adminWhatsAppNumber:
 *           type: string
 *         adminPhoto:
 *           type: string
 *         adminRole:
 *           type: string
 *           enum: [user, admin, superAdmin]
 */

/**
 * @swagger
 * /api/v1/admins:
 *   get:
 *     summary: Daftar admin
 *     description: |
 *       Mengembalikan daftar user dengan role bukan `user`, mengecualikan user yang sedang login.
 *       Filter pencarian by nama (userName LIKE). Pagination aktif jika query `pagination=true`.
 *     tags: [ADMINS]
 *     security:
 *       - bearerAuth: []
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
 *         description: Opsional; filter nama admin (kosong diabaikan)
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Set `true` untuk limit/offset
 *       - in: query
 *         name: adminRole
 *         schema:
 *           type: string
 *           enum: [user, admin, superAdmin]
 *         description: Opsional (schema); service saat ini membangun where tanpa filter adminRole pada findAll
 *     responses:
 *       200:
 *         description: Berhasil — data pagination (format Pagination.formatData)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Tidak terautentikasi (userId JWT tidak ada)
 *       500:
 *         description: Kesalahan server
 *   patch:
 *     summary: Update profil admin (pengguna terautentikasi)
 *     description: |
 *       Memperbarui baris user dengan `userId` dari JWT. Field opsional; minimal satu field.
 *       Nama admin unik (selain user sendiri). Password di-hash sebelum disimpan.
 *     tags: [ADMINS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAdmin'
 *           examples:
 *             updateName:
 *               summary: Ubah nama
 *               value:
 *                 adminName: "Nama Admin Baru"
 *             updateRole:
 *               summary: Ubah role
 *               value:
 *                 adminRole: "admin"
 *     responses:
 *       200:
 *         description: Berhasil diperbarui
 *       400:
 *         description: Validasi gagal, nama duplikat, atau tidak ada field yang diupdate
 *       401:
 *         description: Tidak terautentikasi
 *       404:
 *         description: Admin (user) tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */

/**
 * @swagger
 * /api/v1/admins/detail/{adminId}:
 *   get:
 *     summary: Detail admin by ID
 *     description: |
 *       Validasi request memakai **query** `adminId` (findDetailAdminSchema), bukan path parameter.
 *       Disarankan memanggil dengan path dan query konsisten, mis. `/api/v1/admins/detail/1?adminId=1`.
 *     tags: [ADMINS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Segmen URL (Express); pastikan query adminId sama jika middleware memvalidasi query.
 *       - in: query
 *         name: adminId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Wajib sesuai implementasi validate({ query })
 *     responses:
 *       200:
 *         description: Berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AdminDetail'
 *       400:
 *         description: Validasi query gagal
 *       403:
 *         description: Admin tidak ditemukan atau tidak diizinkan (AppError dari service)
 *       500:
 *         description: Kesalahan server
 */

/**
 * @swagger
 * /api/v1/admins/register:
 *   post:
 *     summary: Registrasi admin baru
 *     description: |
 *       Membuat user admin baru. Nomor WhatsApp harus belum terdaftar (deleted = 0).
 *       Route memvalidasi body dengan **signupAdminSchema** (adminName, adminPassword, adminWhatsAppNumber).
 *     tags: [ADMINS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupAdmin'
 *     responses:
 *       201:
 *         description: Admin berhasil dibuat
 *       400:
 *         description: Validasi gagal atau nomor WA sudah terdaftar
 *       401:
 *         description: Tidak terautentikasi
 *       500:
 *         description: Kesalahan server
 */
