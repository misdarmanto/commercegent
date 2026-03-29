import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { CategoryModel, type CategoryCreationAttributes } from '../models/categories'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import type {
  ICreateCategoryBody,
  IFindAllCategoryQuery,
  IUpdateCategoryBody
} from '../schemas/CategorySchema'

export class CategoryService {
  static async createCategory(body: ICreateCategoryBody) {
    try {
      const payload = {
        categoryName: body.categoryName,
        categoryType: body.categoryType ?? 'parent',
        deleted: 0,
        ...(body.categoryReference != null && {
          categoryReference: body.categoryReference
        }),
        ...(body.categoryIcon != null && { categoryIcon: body.categoryIcon })
      } as CategoryCreationAttributes

      await CategoryModel.create(payload)
      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[CategoryService] createCategory failed: ${String(error)}`)
      throw new AppError('Failed to create category', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updateCategory(body: IUpdateCategoryBody) {
    try {
      const existing = await CategoryModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          categoryId: { [Op.eq]: body.categoryId }
        }
      })

      if (existing == null) {
        throw new AppError('not found!', StatusCodes.NOT_FOUND)
      }

      const newData: Record<string, unknown> = {}
      if (body.categoryIcon != null && String(body.categoryIcon).length > 0) {
        newData.categoryIcon = body.categoryIcon
      }
      if (body.categoryName != null && body.categoryName.length > 0) {
        newData.categoryName = body.categoryName
      }

      await CategoryModel.update(newData, {
        where: {
          deleted: { [Op.eq]: 0 },
          categoryId: { [Op.eq]: body.categoryId }
        }
      })

      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[CategoryService] updateCategory failed: ${String(error)}`)
      throw new AppError('Failed to update category', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async removeCategory(categoryId: number) {
    try {
      const row = await CategoryModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          categoryId: { [Op.eq]: categoryId }
        }
      })

      if (row == null) {
        throw new AppError('category not found!', StatusCodes.NOT_FOUND)
      }

      row.deleted = 1
      await row.save()

      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[CategoryService] removeCategory failed: ${String(error)}`)
      throw new AppError('Failed to remove category', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findAllCategories(query: IFindAllCategoryQuery) {
    try {
      const page = new Pagination(query.page, query.size)

      const result = await CategoryModel.findAndCountAll({
        where: {
          deleted: { [Op.eq]: 0 },
          ...(Boolean(query.search) && {
            [Op.or]: [{ categoryName: { [Op.like]: `%${query.search}%` } }]
          }),
          ...(query.categoryReference != null &&
            query.categoryReference !== '' && {
              categoryReference: query.categoryReference
            }),
          ...(query.categoryType != null && {
            categoryType: query.categoryType
          })
        },
        order: [['categoryId', 'desc']],
        ...(query.pagination === true && {
          limit: page.limit,
          offset: page.offset
        })
      })

      return page.formatData(result)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[CategoryService] findAllCategories failed: ${String(error)}`)
      throw new AppError('Failed to fetch categories', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findDetailCategory(categoryId: number) {
    try {
      const row = await CategoryModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          categoryId: { [Op.eq]: categoryId }
        }
      })

      if (row == null) {
        throw new AppError('not found!', StatusCodes.NOT_FOUND)
      }

      return row
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[CategoryService] findDetailCategory failed: ${String(error)}`)
      throw new AppError('Failed to fetch category', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
