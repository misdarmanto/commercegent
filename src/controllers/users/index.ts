import { findAllUsers } from './findAllUsers'
import { findDetailUser } from './findDetailUser'
import { removeUser } from './removeUser'
import { updateSelfUser } from './updateSelfUser'
import { updateUserCoin } from './updateUserCoin'
import { updateUserPassword } from './updateUserPassword'

export const UsersController = {
  findAllUsers,
  findDetailUser,
  updateSelfUser,
  removeUser,
  updateUserCoin,
  updateUserPassword
}
