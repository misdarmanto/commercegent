import { Pinecone } from '@pinecone-database/pinecone'
import { appConfigs } from './appConfig'

export const pineconeClient = new Pinecone({
  apiKey: appConfigs.pinecone.apiKey ?? ''
})

export const productPineconeIndex = pineconeClient
  .index(appConfigs.pinecone.index)
  .namespace(appConfigs.pinecone.namespace)

export const faqPineconeIndex = pineconeClient
  .index(appConfigs.pinecone.index)
  .namespace(appConfigs.pinecone.faqNamespace)
