import express from "express";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

// Endpoint para verificar autenticación
router.get('/verify-auth', verifyToken, (req, res) => {
    res.json({
        message: "Authenticated",
        user: {
            id: req.user.id,
            userType: req.user.userType
        }
    });
});

// Endpoint para logout
router.post('/logout', (req, res) => {
    // Limpiar cookie de autenticación con las mismas configuraciones
    res.clearCookie("authToken", {
        httpOnly: true,
        secure: true, // HTTPS requerido en producción
        sameSite: 'none', // Permitir cookies cross-site
        path: '/'
    });
    
    res.json({ message: "Logged out successfully" });
});

export default router;