import { z } from 'zod'

export const orderItemSchema = z.object({
  productId: z
    .number({ invalid_type_error: 'Product ID harus berupa angka' })
    .min(0, 'Product ID tidak boleh negatif'),
  quantity: z
    .number({ invalid_type_error: 'Quantity harus berupa angka' })
    .int('Quantity harus bilangan bulat')
    .min(1, 'Quantity minimal 1')
})
