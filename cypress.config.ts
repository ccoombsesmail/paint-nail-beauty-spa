import { defineConfig } from 'cypress'
import prismaClient from './app/database/prismaClient';

export default defineConfig({
  projectId: "au998x",
  video: true,
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    setupNodeEvents(on, config) {
      on("task", {
        async clearDB() {
          try {
            if (process.env.PUBLIC_ROUTES === 'cypress') {
              await prismaClient.transaction.deleteMany({})
              await prismaClient.customer.deleteMany({})
            }
          } catch (e) {
            console.log(e)
          }
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
