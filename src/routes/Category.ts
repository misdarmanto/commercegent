import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { CategoryController } from '../controllers/categories'

const CategoryRoute = Router()

CategoryRoute.get('/', CategoryController.findAll)
CategoryRoute.get('/detail/:categoryId', CategoryController.findOne)
CategoryRoute.post('/', MiddleWares.authorization, CategoryController.create)
CategoryRoute.patch('/', MiddleWares.authorization, CategoryController.update)
CategoryRoute.delete('/', MiddleWares.authorization, CategoryController.remove)

export default CategoryRoute
