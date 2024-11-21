/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://Naukri-Sahayak_owner:6mxCYw2KJtap@ep-plain-dawn-a5fiv5fh.us-east-2.aws.neon.tech/Naukri-Sahayak?sslmode=require',
    }
  };