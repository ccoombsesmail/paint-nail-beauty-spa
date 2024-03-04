import { defineConfig } from 'cypress'
import prismaClient from './app/database/prismaClient';

export default defineConfig({
  projectId: "au998x",
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        async clearDB() {
          await prismaClient.transaction.deleteMany({})
          await prismaClient.customer.deleteMany({})

          return null
        }

      })

    },
    experimentalRunAllSpecs: true,
    defaultCommandTimeout: 10000
  },
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
})
