import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { col, fn, Op } from 'sequelize'
import { Pagination } from '../../utilities/pagination'
import { OrdersModel } from '../../models/orders'
import { ProductModel } from '../../models/products'
import { UserModel } from '../../models/user'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { OrderItemsModel } from '../../models/orderItems'
import { findAllOrderPublicSchema } from '../../schemas/publicApiSchema'

export const findAllOrderPublic = async (req: any, res: Response): Promise<any> => {
  const { error: validationError, value: validatedData } = validateRequest(
    findAllOrderPublicSchema,
    req.query
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    const page = new Pagination(
      parseInt(req.query.page) ?? 0,
      parseInt(req.query.size) ?? 10
    )

    const dateFilter: any = {}

    if (req.query.startDate && req.query.endDate) {
      dateFilter.created_at = {
        [Op.between]: [`${req.query.startDate} 00:00:00`, `${req.query.endDate} 23:59:59`]
      }
    } else if (req.query.startDate) {
      dateFilter.created_at = {
        [Op.gte]: `${req.query.startDate} 00:00:00`
      }
    } else if (req.query.endDate) {
      dateFilter.created_at = {
        [Op.lte]: `${req.query.endDate} 23:59:59`
      }
    }

    const result = await OrdersModel.findAndCountAll({
      where: {
        deleted: { [Op.eq]: 0 },
        ...dateFilter,
        ...(Boolean(req.query.search) && {
          [Op.or]: [{ orderReferenceId: { [Op.like]: `%${req.query.search}%` } }]
        }),
        ...(Boolean(req.query?.orderStatus) && {
          orderStatus: { [Op.eq]: req.query.orderStatus }
        })
      },
      attributes: [
        'orderId',
        'orderSubtotal',
        'orderShippingFee',
        'orderGrandTotal',
        'orderTotalItem',
        'orderCourierCompany',
        'orderTrackingId',
        'orderWaybillId',
        'orderPaymentUrl',
        'orderReferenceId',
        'orderStatus',
        [fn('DATE', col('orders.created_at')), 'orderDate'],
        [fn('TIME', col('orders.created_at')), 'orderTime']
      ],
      include: [
        {
          model: UserModel,
          where: {
            deleted: { [Op.eq]: 0 },
            ...(Boolean(req.query.search) && {
              [Op.or]: [{ userName: { [Op.like]: `%${req.query.search}%` } }]
            })
          },
          attributes: ['userName', 'userWhatsAppNumber']
        },
        {
          model: OrderItemsModel,
          as: 'orderItems',
          attributes: [
            'productNameSnapshot',
            'productPriceSnapshot',
            'productDiscountSnapshot',
            'productSellPriceSnapshot',
            'quantity',
            'totalPrice'
          ],
          include: [
            {
              model: ProductModel,
              attributes: [
                'productId',
                'productName',
                'productCode',
                'productStock',
                'productWeight',
                'productIsVisible',
                'productBarcode',
                'productUnit'
              ]
            }
          ]
        }
      ],
      order: [['orderId', 'desc']],
      ...(req.query.pagination === 'true' && {
        limit: page.limit,
        offset: page.offset
      })
    })

    const response = ResponseData.default
    response.data = page.data(result)
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
