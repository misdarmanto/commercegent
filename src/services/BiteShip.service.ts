import axios from 'axios'
import { appConfigs } from '../configs/appConfig'

export const BiteShipService = axios.create({
  baseURL: appConfigs.biteShip.baseURL,
  headers: {
    Authorization: `Bearer ${appConfigs.biteShip.apiKey}`,
    'Content-Type': 'application/json'
  }
})
