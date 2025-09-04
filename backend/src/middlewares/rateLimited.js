import rateLimit from 'express-rate-limit';

//Se configura el rate limiter

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 2, // Limitar cada IP a 1000 solicitudes por ventana de tiempo
    message: {
        status: 429,
        error: "Too many requests",
    },
});

export default limiter;