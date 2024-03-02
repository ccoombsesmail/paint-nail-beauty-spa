import { defineConfig } from 'cypress'
import prismaClient from './app/database/prismaClient';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        async clearDB() {
          await prismaClient.transaction.deleteMany({})
          await prismaClient.customer.deleteMany({})

          return null
        }

      })

    }

    ,
    baseUrl: 'http://localhost:3000'
  },
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
})
