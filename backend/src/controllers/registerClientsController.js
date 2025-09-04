import nodemailer from "nodemailer";
import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import clientsModel from "../models/Clients.js";
import { config } from "../config.js";

const registerClientsController = {};

registerClientsController.register = async (req, res) => {
    const { name, lastName, birthday, email, password, telephone, dui, isVerified } = req.body;

    try {
        // Verificar si el cliente ya existe
        const existsClient = await clientsModel.findOne({ email });
        if (existsClient) {
            return res.json({ message: "Client already exists" });
        }

        // Hashear contraseña
        const passwordHash = await bcryptjs.hash(password, 10);

        // Crear nuevo cliente
        const newClient = new clientsModel({
            name, 
            lastName, 
            birthday, 
            email, 
            password: passwordHash, 
            telephone, 
            dui: dui || null, 
            isVerified: isVerified || false
        });

        await newClient.save();

        // Generar código de verificación
        const verificationCode = crypto.randomBytes(3).toString("hex");

        // Crear token para verificación de email
        const tokenCode = jsonwebtoken.sign(
            { email, verificationCode },
            config.JWT.secret,
            { expiresIn: "2h" }
        );

        // Configurar cookie para producción (cross-domain)
        res.cookie("verificationToken", tokenCode, {
            maxAge: 2 * 60 * 60 * 1000, // 2 horas
            httpOnly: true,
            secure: true, // HTTPS requerido en producción
            sameSite: 'none', // Permitir cookies cross-site
            path: '/'
        });

        // Configurar transporter para email
        const transporter = nodemailer.createTransporter({
            service: "gmail",
            auth: {
                user: config.emailUser.user_email,
                pass: config.emailUser.user_pass
            }
        });

        // Configurar opciones del email
        const mailOptions = {
            from: config.emailUser.user_email,
            to: email,
            subject: "Verificación de cuenta",
            text: `Para verificar tu cuenta utiliza este código: ${verificationCode}. Expira en dos horas.`
        };

        // Enviar email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Email Error: " + error);
                return res.status(500).json({ message: "Error sending verification email" });
            }
            
            res.json({ 
                message: "Client registered, please verify your email",
                info: "Verification email sent"
            });
        });

    } catch (error) {
        console.log("Register Client Error: " + error);
        res.status(500).json({ message: "Internal server error" });
    }
};

registerClientsController.verifyCodeEmail = async (req, res) => {
    const { verificationCodeRequest } = req.body;

    try {
        const token = req.cookies.verificationToken;

        if (!token) {
            return res.status(401).json({ message: "No verification token found" });
        }

        const decoded = jsonwebtoken.verify(token, config.JWT.secret);
        const { email, verificationCode: storedCode } = decoded;

        if (verificationCodeRequest !== storedCode) {
            return res.json({ message: "Invalid code." });
        }

        // Actualizar cliente como verificado
        const client = await clientsModel.findOne({ email });
        if (!client) {
            return res.status(404).json({ message: "Client not found" });
        }

        client.isVerified = true;
        await client.save();

        // Limpiar cookie de verificación
        res.clearCookie("verificationToken", {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/'
        });

        res.json({ message: "Email verified successfully" });
    } catch (error) {
        console.log("Verify Email Error: " + error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid verification token" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export default registerClientsController;