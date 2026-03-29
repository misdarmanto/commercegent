import { createCategory } from './create'
import { findAllCategory, findDetailCategory } from './find'
import { removeCategory } from './remove'
import { updateCategory } from './update'

export const CategoryController = {
  create: createCategory,
  findAll: findAllCategory,
  findOne: findDetailCategory,
  remove: removeCategory,
  update: updateCategory
}
