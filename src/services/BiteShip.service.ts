import axios from 'axios'

export const BiteShipService = axios.create({
  baseURL: process.env.BITESHIP_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.BITESHIP_API_KEY}`,
    'Content-Type': 'application/json'
  }
})
