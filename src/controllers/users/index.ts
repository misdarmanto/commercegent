import { findAllUsers } from './findAllUsers'
import { findDetailUser } from './findDetailUser'
import { loginUser } from './loginUser'
import { registerUser } from './registerUser'
import { removeUser } from './removeUser'
import { requestUserOtp } from './requestUserOtp'
import { updateSelfUser } from './updateSelfUser'
import { updateUserCoin } from './updateUserCoin'
import { updateUserPassword } from './updateUserPassword'
import { verifyUserOtp } from './verifyUserOtp'

export const UsersController = {
  login: loginUser,
  register: registerUser,
  findAll: findAllUsers,
  findDetailUser,
  update: updateSelfUser,
  remove: removeUser,
  updateUserCoin,
  updatePassword: updateUserPassword,
  requestOtp: requestUserOtp,
  verifyOtp: verifyUserOtp
}
