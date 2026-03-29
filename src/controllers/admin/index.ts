import { createAdmin } from './create'
import { findAllAdmin, findDetailAdmin } from './find'
import { updateAdmin } from './update'
import { loginAdmin } from './login'

export const AdminController = {
  createAdmin,
  findDetailAdmin,
  findAllAdmin,
  updateAdmin,
  loginAdmin
}
