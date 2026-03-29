import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Op } from 'sequelize'
import { sequelize } from '../../models'
import { OrdersAttributes, OrdersModel } from '../../models/orders'
import { OrderItemsAttributes, OrderItemsModel } from '../../models/orderItems'
import { ProductModel } from '../../models/products'
import { AddressesModel } from '../../models/address'
import { CartsModel } from '../../models/carts'
import { ResponseData } from '../../utilities/response'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { MidtransSnap } from '../../configs/midtrans'
import { createOrderSchema } from '../../schemas/orderSchema'
import { type IAuthenticatedRequest } from '../../interfaces/shared'

export const createOrder = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<any> => {
  const { error: validationError, value: validatedData } = validateRequest(
    createOrderSchema,
    req.body
  )

  if (validationError) return handleValidationError(res, validationError)

  const { items, orderShippingFee, orderCourierCompany, orderCourierType } =
    validatedData!

  const t = await sequelize.transaction()

  try {
    /* 1 CEK ALAMAT */
    const address = await AddressesModel.findOne({
      where: {
        deleted: { [Op.eq]: 0 },
        addressUserId: req.jwtPayload?.userId,
        addressCategory: 'user'
      },
      transaction: t
    })

    if (!address) {
      await t.rollback()
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(ResponseData.error('alamat pengiriman tidak ditemukan'))
    }

    /* 2 AMBIL PRODUK */
    const productIds = items.map((i: any) => i.productId)

    const products = await ProductModel.findAll({
      where: {
        deleted: { [Op.eq]: 0 },
        productId: { [Op.in]: productIds }
      },
      transaction: t,
      lock: t.LOCK.UPDATE
    })

    if (products.length !== items.length) {
      await t.rollback()
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(ResponseData.error('salah satu produk tidak ditemukan'))
    }

    // CEK STOK
    for (const item of items) {
      const product = products.find((p) => String(p.productId) === String(item.productId))

      if (!product) continue

      if (product.productStock < item.quantity) {
        await t.rollback()
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(ResponseData.error(`Stock produk ${product.productName} tidak mencukupi`))
      }
    }

    /* 3 HITUNG TOTAL */
    let orderSubtotal = 0
    let orderTotalItem = 0

    const orderItemsPayload = items.map((item: any) => {
      const product = products.find((p) => String(p.productId) === String(item.productId))

      const quantity = item.quantity
      const price = Number(product!.productSellPrice)
      const totalPrice = price * quantity

      orderSubtotal += totalPrice
      orderTotalItem += quantity

      return {
        productId: product!.productId,
        productNameSnapshot: product!.productName,
        productPriceSnapshot: price,
        productDiscountSnapshot: product!.productDiscount,
        productSellPriceSnapshot: product!.productSellPrice,
        quantity,
        totalPrice
      }
    })

    /* 4 CREATE ORDER HEADER */

    const orderPayload = {
      orderUserId: req.jwtPayload?.userId,
      orderSubtotal,
      orderShippingFee,
      orderGrandTotal: orderSubtotal + orderShippingFee,
      orderTotalItem,
      orderCourierCompany,
      orderCourierType
    } as OrdersAttributes | any

    const order = await OrdersModel.create(orderPayload, { transaction: t })

    /* 5 CREATE ORDER ITEMS */
    for (const item of orderItemsPayload) {
      const payload = {
        orderId: order.orderId,
        productId: item.productId,
        productNameSnapshot: item.productNameSnapshot,
        productPriceSnapshot: item.productPriceSnapshot,
        productDiscountSnapshot: item.productDiscountSnapshot,
        productSellPriceSnapshot: item.productSellPriceSnapshot,
        quantity: item.quantity,
        totalPrice: item.totalPrice
      } as OrderItemsAttributes

      await OrderItemsModel.create(payload, { transaction: t })
    }

    /* 5 UPDATE STOK PRODUK */
    for (const item of orderItemsPayload) {
      await ProductModel.update(
        {
          productStock: sequelize.literal(`product_stock - ${item.quantity}`),
          productTotalSale: sequelize.literal(`product_total_sale + ${item.quantity}`)
        },
        {
          where: {
            productId: item.productId,
            deleted: { [Op.eq]: 0 }
          },
          transaction: t
        }
      )
    }

    const orderReferenceId = `ORDER-${order.orderId}-${Date.now()}`
    /* 6 MIDTRANS */
    const midtransParams = {
      transaction_details: {
        order_id: orderReferenceId,
        gross_amount: order.orderGrandTotal
      },
      customer_details: {
        first_name: address.addressUserName,
        phone: address.addressKontak
      },
      item_details: [
        ...orderItemsPayload.map((item) => ({
          id: String(item.productId),
          price: item.productPriceSnapshot,
          discount: item.productDiscountSnapshot,
          sellPrice: item.productSellPriceSnapshot,
          quantity: item.quantity,
          name: item.productNameSnapshot
        })),
        {
          id: 'SHIPPING',
          price: orderShippingFee,
          quantity: 1,
          name: 'Shipping Fee'
        }
      ]
    }

    const midtransResponse = await MidtransSnap.createTransaction(midtransParams)

    /* ===================== 7. SAVE PAYMENT URL ===================== */
    await order.update(
      {
        orderPaymentUrl: midtransResponse.redirect_url,
        orderPaymentToken: midtransResponse.token,
        orderReferenceId: orderReferenceId
      },
      { transaction: t }
    )

    /* ===================== 8. CLEAR CART =============================*/
    await CartsModel.destroy({
      where: {
        deleted: { [Op.eq]: 0 },
        cartUserId: req.jwtPayload?.userId,
        cartProductId: { [Op.in]: productIds }
      },
      transaction: t
    })

    await t.commit()

    return res.status(StatusCodes.CREATED).json({
      ...ResponseData.default,
      data: {
        orderId: order.orderId,
        snapToken: midtransResponse.token,
        redirectUrl: midtransResponse.redirect_url
      }
    })
  } catch (error) {
    await t.rollback()
    return handleServerError(res, error)
  }
}
