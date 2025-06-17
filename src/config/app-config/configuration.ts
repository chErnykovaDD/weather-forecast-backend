export default () => ({
  database: {
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    db: process.env.POSTGRES_DB,
    port: process.env.POSTGRES_PORT,
  },
  app: {
    port: process.env.PORT,
    url: process.env.BASE_URL,
    globalPrefix: process.env.GLOBAL_PREFIX,
  },
});
