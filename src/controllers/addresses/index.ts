import { createAdminAddress } from './createAdminAddress'
import { createUserAddress } from './createUserAddress'
import { findAdminAddress } from './findAdminAddress'
import { findUserAddress } from './findUserAddress'
import { removeAddress } from './removeAddress'
import { updateAdminAddress } from './updateAdminAddress'
import { updateAddressToMain } from './updateAddressToMain'

export const AddressController = {
  createUserAddress,
  createAdminAddress,
  removeAddress,
  findUserAddress,
  findAdminAddress,
  updateAdminAddress,
  updateAddressToMain
}
