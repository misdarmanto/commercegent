import { createAdminAddress } from './createAdminAddress'
import { createUserAddress } from './createUserAddress'
import { findAdminAddress } from './findAdminAddress'
import { findDistricts } from './findDistricts'
import { findProvinces } from './findProvince'
import { findRegencies } from './findRegencies'
import { findUserAddress } from './findUserAddress'
import { findVillages } from './findVillages'
import { removeAddress } from './remove'

export const AddressController = {
  createUserAddress,
  createAdminAddress,
  remove: removeAddress,
  findUserAddress,
  findAdminAddress,
  findProvinces,
  findRegencies,
  findDistricts,
  findVillages
}
