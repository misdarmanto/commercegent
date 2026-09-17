import dotenv from 'dotenv'
dotenv.config()

export const appConfigs = {
  biteShip: {
    baseURL: process.env.BITESHIP_BASE_URL,
    apiKey: process.env.BITESHIP_API_KEY
  },
  openAi: {
    apiKey: process.env.OPENAI_API_KEY,
    chatModel: process.env.OPENAI_CHAT_MODEL ?? 'gpt-4o-mini',
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
    embeddingDimensions: Number(process.env.OPENAI_EMBEDDING_DIMENSIONS ?? 1024)
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    index: process.env.PINECONE_INDEX ?? 'ecommerce-products',
    namespace: process.env.PINECONE_NAMESPACE ?? 'products',
    faqNamespace: process.env.PINECONE_FAQ_NAMESPACE ?? 'faqs'
  },
  app: {
    appVersion: process.env.APP_VERSION ?? '',
    appMode: process.env.APP_MODE ?? 'development',
    env: process.env.APP_ENV,
    port: process.env.APP_PORT ?? 8000,
    url: process.env.APP_URL ?? 'http://localhost:8000',
    log: process.env.APP_LOG === 'true'
  },
  secret: {
    keyEncryption: process.env.SECRET_KEY_ENCRYPTION,
    passwordEncryption: process.env.SECRET_PASSWORD_ENCRYPTION,
    pinEncryption: process.env.SECRET_PIN_ENCRYPTION,
    token: process.env.TOKEN_SECRET
  },
  redis: {
    host: process.env.REDIS_HOST || '',
    port: process.env.REDIS_PORT || 6379
  },
  wablas: {
    url: process.env.WABLAS_URL,
    apiKey: `${process.env.WABLAS_API_KEY}.${process.env.WABLAS_SECRET_KEY}`
  },
  cors: {
    origin: process.env.CORS_ORIGIN
  },
  midtrans: {
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true'
  },
  rateLimit: {
    windowMinutes: process.env.RATE_LIMIT_WINDOW_MINUTES,
    maxRequest: process.env.RATE_LIMIT_MAX_REQUESTS
  },
  dataBase: {
    development: {
      username: process.env.DB_USER_NAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT,
      logging: process.env.DB_LOG === 'true',
      port: process.env.DB_PORT
    },
    testing: {
      username: process.env.DB_USER_NAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT,
      logging: process.env.DB_LOG === 'true',
      port: process.env.DB_PORT
    },
    production: {
      username: process.env.DB_USER_NAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT,
      logging: process.env.DB_LOG === 'true',
      port: process.env.DB_PORT
    }
  }
}
