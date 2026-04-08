import { Op, WhereOptions } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import {
  CategoryModel,
  type CategoryAttributes,
  type CategoryCreationAttributes
} from '../models/categories'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import type {
  ICreateCategory,
  IFindAllCategories,
  IFindDetailCategory,
  IUpdateCategory,
  IRemoveCategory
} from '../schemas/CategorySchema'

export class CategoryService {
  private static buildFindAllWhere(
    payload: IFindAllCategories
  ): WhereOptions<CategoryAttributes> {
    const where: WhereOptions<CategoryAttributes> = {
      deleted: { [Op.eq]: 0 }
    }

    if (payload.search != null) {
      where.categoryName = { [Op.like]: `%${payload.search}%` }
    }

    if (payload.categoryReference != null) {
      where.categoryReference = payload.categoryReference
    }

    if (payload.categoryType != null) {
      where.categoryType = payload.categoryType
    }

    return where
  }

  static async findAllCategories(payload: IFindAllCategories) {
    try {
      const pager = new Pagination(payload.page, payload.size)

      const result = await CategoryModel.findAndCountAll({
        where: this.buildFindAllWhere(payload),
        order: [['categoryId', 'desc']],
        ...(payload.pagination === true && {
          limit: pager.limit,
          offset: pager.offset
        })
      })

      return pager.formatData(result)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[CategoryService] findAllCategories failed: ${String(serviceError)}`)
      throw new AppError('Failed to find categories', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findDetailCategory(payload: IFindDetailCategory) {
    try {
      const result = await CategoryModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          categoryId: { [Op.eq]: payload.categoryId }
        }
      })

      if (result == null) {
        throw new AppError('not found!', StatusCodes.NOT_FOUND)
      }

      return result
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[CategoryService] findDetailCategory failed: ${String(serviceError)}`)
      throw new AppError('Failed to find category', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async createCategory(body: ICreateCategory) {
    try {
      const payload: CategoryCreationAttributes = {
        categoryName: body.categoryName,
        categoryType: body.categoryType ?? 'parent',
        deleted: 0,
        categoryReference: body.categoryReference ?? '',
        categoryIcon: body.categoryIcon ?? ''
      }

      await CategoryModel.create(payload)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[CategoryService] createCategory failed: ${String(serviceError)}`)
      throw new AppError('Failed to create category', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updateCategory(payload: IUpdateCategory) {
    try {
      const newData: Partial<Pick<CategoryAttributes, 'categoryIcon' | 'categoryName'>> =
        {}
      if (payload.categoryIcon != null && payload.categoryIcon.length > 0) {
        newData.categoryIcon = payload.categoryIcon
      }
      if (payload.categoryName != null && payload.categoryName.length > 0) {
        newData.categoryName = payload.categoryName
      }

      if (Object.keys(newData).length === 0) {
        throw new AppError('No fields to update', StatusCodes.BAD_REQUEST)
      }

      const [updatedRows] = await CategoryModel.update(newData, {
        where: {
          deleted: { [Op.eq]: 0 },
          categoryId: { [Op.eq]: payload.categoryId }
        }
      })

      if (updatedRows === 0) {
        throw new AppError('not found!', StatusCodes.NOT_FOUND)
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[CategoryService] updateCategory failed: ${String(serviceError)}`)
      throw new AppError('Failed to update category', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async removeCategory(payload: IRemoveCategory) {
    try {
      const [updatedRows] = await CategoryModel.update(
        { deleted: 1 },
        {
          where: {
            deleted: { [Op.eq]: 0 },
            categoryId: { [Op.eq]: payload.categoryId }
          }
        }
      )

      if (updatedRows === 0) {
        throw new AppError('category not found!', StatusCodes.NOT_FOUND)
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[CategoryService] removeCategory failed: ${String(serviceError)}`)
      throw new AppError('Failed to remove category', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
