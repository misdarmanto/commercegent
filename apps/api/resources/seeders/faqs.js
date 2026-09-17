/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use strict'

/** @type {import('sequelize-cli').Migration} */

const seedFaqs = [
  {
    faq_question: 'How long does shipping take?',
    faq_answer:
      'Shipping usually takes 2-3 business days for in-city delivery and 4-7 business days for out-of-city delivery, depending on the courier chosen.'
  },
  {
    faq_question: 'What payment methods are available?',
    faq_answer:
      'We accept bank transfer, credit/debit card, and e-wallets (GoPay, OVO, ShopeePay) via Midtrans.'
  },
  {
    faq_question: 'How do I return an item?',
    faq_answer:
      'Returns can be requested within 3 days of receiving the item, as long as the product is unused and the packaging is intact. Contact customer service to process a return.'
  },
  {
    faq_question: 'Is there a minimum purchase for free shipping?',
    faq_answer: 'Free shipping applies to purchases of at least Rp100,000 within the same city.'
  },
  {
    faq_question: 'How can I track my order status?',
    faq_answer:
      'You can track your order status on the Order History page in your account once the order is confirmed and shipped.'
  }
]

module.exports = {
  async up(queryInterface, Sequelize) {
    // sequelize-cli re-runs every seeder on each `db:seed:all` call with no
    // built-in tracking, so guard against inserting duplicate rows here.
    const [existing] = await queryInterface.sequelize.query(
      'SELECT faq_question FROM faqs WHERE faq_question IN (:questions)',
      { replacements: { questions: seedFaqs.map((faq) => faq.faq_question) } }
    )
    const existingQuestions = new Set(existing.map((row) => row.faq_question))
    const faqsToInsert = seedFaqs.filter((faq) => !existingQuestions.has(faq.faq_question))

    if (faqsToInsert.length === 0) return

    await queryInterface.bulkInsert('faqs', faqsToInsert)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('faqs', {
      faq_question: seedFaqs.map((faq) => faq.faq_question)
    })
  }
}
