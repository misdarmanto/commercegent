import { findAllUser, findDetailUser } from './find'
import { userLogin } from './login'
import { userRegister } from './register'
import { removeUser } from './remove'
import { requestOtp } from './requestOtp'
import { updateUser } from './update'
import { updateUserCoin } from './updateCoin'
import { updatePassword } from './updatePassword'
import { verifyOtp } from './verifyOtp'

export const UsersController = {
  login: userLogin,
  register: userRegister,
  findAll: findAllUser,
  findDetailUser,
  update: updateUser,
  remove: removeUser,
  updateUserCoin,
  updatePassword,
  requestOtp,
  verifyOtp
}
