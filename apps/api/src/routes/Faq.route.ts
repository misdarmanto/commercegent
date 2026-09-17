import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { FaqController } from '../controllers/faq'
import {
  createFaqSchema,
  findAllFaqsSchema,
  removeFaqSchema,
  updateFaqSchema
} from '../schemas/faqSchema'

const FaqRoute = Router()

FaqRoute.get(
  '/',
  MiddleWares.validate({ query: findAllFaqsSchema }),
  FaqController.findAllFaqs
)

FaqRoute.post(
  '/',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  MiddleWares.validate({ body: createFaqSchema }),
  FaqController.createFaq
)

FaqRoute.patch(
  '/',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  MiddleWares.validate({ body: updateFaqSchema }),
  FaqController.updateFaq
)

FaqRoute.delete(
  '/',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  MiddleWares.validate({ query: removeFaqSchema }),
  FaqController.removeFaq
)

export default FaqRoute
