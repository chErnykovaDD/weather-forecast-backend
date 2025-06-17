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
    weather: {
        apiKey: process.env.WEATHER_API_KEY,
        url: process.env.WEATHER_URL,
    },
    mail: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
    token: {
        secret: process.env.SECRET_KEY,
    },
});
