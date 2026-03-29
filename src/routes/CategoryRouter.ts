import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { CategoryController } from '../controllers/categories'
import {
  createCategorySchema,
  findAllCategorySchema,
  findDetailCategoryParamsSchema,
  removeCategoryQuerySchema,
  updateCategorySchema
} from '../schemas/CategorySchema'

const CategoryRoute = Router()

CategoryRoute.get(
  '/',
  MiddleWares.validate({ query: findAllCategorySchema }),
  CategoryController.findAllCategory
)

CategoryRoute.get(
  '/detail/:categoryId',
  MiddleWares.validate({ params: findDetailCategoryParamsSchema }),
  CategoryController.findDetailCategory
)

CategoryRoute.post(
  '/',
  MiddleWares.authorization,
  MiddleWares.validate({ body: createCategorySchema }),
  CategoryController.createCategory
)

CategoryRoute.patch(
  '/',
  MiddleWares.authorization,
  MiddleWares.validate({ body: updateCategorySchema }),
  CategoryController.updateCategory
)

CategoryRoute.delete(
  '/',
  MiddleWares.authorization,
  MiddleWares.validate({ query: removeCategoryQuerySchema }),
  CategoryController.removeCategory
)

export default CategoryRoute
