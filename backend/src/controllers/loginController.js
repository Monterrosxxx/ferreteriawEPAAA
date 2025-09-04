import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import clientModel from "../models/Clients.js";
import employeesModel from "../models/Employees.js";
import { config } from "../config.js";

const loginController = {};

loginController.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let userFound;
        let userType;

        // Verificar si es el usuario admin
        if (email === config.admin.email && password === config.admin.password) {
            userType = "admin";
            userFound = { _id: "admin" };
        } else {
            // Buscar primero en empleados
            userFound = await employeesModel.findOne({ email });
            userType = "employee";

            // Si no se encuentra en empleados, buscar en clientes
            if (!userFound) {
                userFound = await clientModel.findOne({ email });
                userType = "client";
            }
        }

        // Si no se encuentra el usuario
        if (!userFound) {
            return res.json({ message: "User not found" });
        }

        // Verificar contraseña (solo si no es admin)
        if (userType !== "admin") {
            const isMatch = await bcryptjs.compare(password, userFound.password);
            if (!isMatch) {
                return res.json({ message: "Invalid password" });
            }
        }

        // Crear y firmar el token JWT
        jsonwebtoken.sign(
            { id: userFound._id, userType },
            config.JWT.secret,
            { expiresIn: config.JWT.expires },
            (error, token) => {
                if (error) {
                    console.log("JWT Error: " + error);
                    return res.status(500).json({ message: "Error creating token" });
                }

                // Configurar cookie para producción (cross-domain)
                // En producción necesitamos secure: true y sameSite: 'none'
                res.cookie("authToken", token, {
                    httpOnly: true,
                    secure: true, // HTTPS requerido en producción
                    sameSite: 'none', // Permitir cookies cross-site
                    maxAge: 24 * 60 * 60 * 1000, // 24 horas
                    path: '/' // Asegurar que la cookie esté disponible en todas las rutas
                });

                res.json({ 
                    message: "login successful",
                    user: {
                        id: userFound._id,
                        userType: userType
                    }
                });
            }
        );
    } catch (error) {
        console.log("Login Error: " + error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export default loginController;