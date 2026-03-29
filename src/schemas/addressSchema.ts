import { z } from 'zod'
import { jwtPayloadSchema } from './jwtPayloadSchema'

export const createAddressSchema = z.object({
  jwtPayload: jwtPayloadSchema,

  addressUserName: z
    .string({ required_error: 'Nama penerima wajib diisi' })
    .min(3, 'Nama penerima minimal 3 karakter')
    .max(100, 'Nama penerima maksimal 100 karakter'),

  addressKontak: z
    .string({ required_error: 'Nomor kontak wajib diisi' })
    .regex(/^[0-9+]+$/, 'Nomor kontak hanya boleh berisi angka atau tanda +')
    .min(10, 'Nomor kontak minimal 10 digit')
    .max(15, 'Nomor kontak maksimal 15 digit'),

  addressDetail: z
    .string({ required_error: 'Detail alamat wajib diisi' })
    .min(5, 'Detail alamat minimal 5 karakter')
    .max(255, 'Detail alamat maksimal 255 karakter'),

  addressPostalCode: z
    .string({ required_error: 'Kode pos wajib diisi' })
    .regex(/^[0-9]+$/, 'Kode pos hanya boleh berisi angka'),

  addressProvinsi: z
    .string({ required_error: 'Provinsi wajib diisi' })
    .min(3, 'Provinsi minimal 3 karakter')
    .max(100, 'Provinsi maksimal 100 karakter'),

  addressKabupaten: z
    .string({ required_error: 'Kabupaten wajib diisi' })
    .min(3, 'Kabupaten minimal 3 karakter')
    .max(100, 'Kabupaten maksimal 100 karakter'),

  addressKecamatan: z
    .string({ required_error: 'Kecamatan wajib diisi' })
    .min(3, 'Kecamatan minimal 3 karakter')
    .max(100, 'Kecamatan maksimal 100 karakter'),

  addressDesa: z
    .string({ required_error: 'Desa wajib diisi' })
    .min(3, 'Desa minimal 3 karakter')
    .max(100, 'Desa maksimal 100 karakter'),

  addressLongitude: z
    .string({ required_error: 'Longitude wajib diisi' })
    .regex(/^-?\d+(\.\d+)?$/, 'Format longitude tidak valid'),

  addressLatitude: z
    .string({ required_error: 'Latitude wajib diisi' })
    .regex(/^-?\d+(\.\d+)?$/, 'Format latitude tidak valid')
})
