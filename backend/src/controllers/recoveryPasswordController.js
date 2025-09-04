import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import clientsModel from "../models/Clients.js";
import employeesModel from "../models/Employees.js";
import { sendEmail, HTMLRecoveryEmail } from "../utils/mailRecoveryPassword.js";
import { config } from "../config.js";

const recoveryPasswordController = {};

recoveryPasswordController.requestCode = async (req, res) => {
    const { email } = req.body;

    try {
        let userFound;
        let userType;

        // Buscar usuario en clientes
        userFound = await clientsModel.findOne({ email })
        if (userFound) {
            userType = "client";
        } else {
            // Buscar en empleados si no se encuentra en clientes
            userFound = await employeesModel.findOne({ email })
            if (userFound) {
                userType = "employee";
            }
        }

        if (!userFound) {
            return res.json({ message: "User not found" });
        }

        // Generar código de verificación de 5 dígitos
        const code = Math.floor(10000 + Math.random() * 90000).toString();

        // Crear token con información del código
        const token = jsonwebtoken.sign(
            { email, code, userType, verified: false },
            config.JWT.secret,
            { expiresIn: "20m" }
        );

        // Configurar cookie para producción (cross-domain)
        res.cookie("tokenRecoveryCode", token, { 
            maxAge: 20 * 60 * 1000, // 20 minutos
            httpOnly: true,
            secure: true, // HTTPS requerido en producción
            sameSite: 'none', // Permitir cookies cross-site
            path: '/'
        });

        // Enviar email con código de verificación
        await sendEmail(
            email,
            "Password recovery code",
            `Your verification code is: ${code}`,
            HTMLRecoveryEmail(code)
        );

        res.json({ message: "Verification code sent" });
    } catch (error) {
        console.log("Request Code Error: " + error);
        res.status(500).json({ message: "Internal server error" });
    }
};

recoveryPasswordController.verifyCode = async (req, res) => {
    const { code } = req.body;

    try {
        const token = req.cookies.tokenRecoveryCode;
        
        if (!token) {
            return res.status(401).json({ message: "No verification token found" });
        }

        const decoded = jsonwebtoken.verify(token, config.JWT.secret);

        if (decoded.code !== code) {
            return res.json({ message: "Invalid code" });
        }

        // Crear nuevo token marcado como verificado
        const newToken = jsonwebtoken.sign(
            {
                email: decoded.email,
                code: decoded.code,
                userType: decoded.userType,
                verified: true,
            },
            config.JWT.secret,
            { expiresIn: "20m" }
        );

        // Actualizar cookie con token verificado
        res.cookie("tokenRecoveryCode", newToken, {
            maxAge: 20 * 60 * 1000, // 20 minutos
            httpOnly: true,
            secure: true, // HTTPS requerido en producción
            sameSite: 'none', // Permitir cookies cross-site
            path: '/'
        });

        res.json({ message: "Code verified successfully" });
    } catch (error) {
        console.log("Verify Code Error: " + error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid verification token" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

recoveryPasswordController.newPassword = async (req, res) => {
    const { newPassword } = req.body;

    try {
        const token = req.cookies.tokenRecoveryCode;

        if (!token) {
            return res.status(401).json({ message: "No verification token found" });
        }

        const decoded = jsonwebtoken.verify(token, config.JWT.secret);

        if (!decoded.verified) {
            return res.json({ message: "Code not verified" });
        }

        const { email, userType } = decoded;

        // Hashear la nueva contraseña
        const hashedPassword = await bcryptjs.hash(newPassword, 10);

        let updatedUser;

        // Actualizar contraseña según el tipo de usuario
        if (userType === "client") {
            updatedUser = await clientsModel.findOneAndUpdate(
                { email },
                { password: hashedPassword },
                { new: true }
            );
        } else if (userType === "employee") {
            updatedUser = await employeesModel.findOneAndUpdate(
                { email },
                { password: hashedPassword },
                { new: true }
            );
        }

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Limpiar cookie de recuperación
        res.clearCookie("tokenRecoveryCode", {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/'
        });

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.log("New Password Error: " + error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid verification token" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export default recoveryPasswordController;