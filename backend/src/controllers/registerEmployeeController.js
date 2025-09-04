import employeeModel from "../models/Employees.js";
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { config } from "../config.js";

const registerEmployeeController = {};

registerEmployeeController.register = async (req, res) => {
    const { name, lastName, birthday, email, address, hireDate, password, telephone, dui, isssNumber, isVerified } = req.body;

    try {
        // Verificar si el empleado ya existe
        const employeeExist = await employeeModel.findOne({ email });
        if (employeeExist) {
            return res.json({ message: "Employee already exist" });
        }

        // Hashear contraseña
        const passwordHash = await bcryptjs.hash(password, 10);

        // Crear nuevo empleado
        const newEmployee = new employeeModel({
            name, 
            lastName, 
            birthday, 
            email, 
            address, 
            hireDate, 
            password: passwordHash, 
            telephone, 
            dui, 
            isssNumber, 
            isVerified
        });

        await newEmployee.save();
        
        // Crear y firmar token JWT
        jsonwebtoken.sign(
            { id: newEmployee._id, userType: "employee" },
            config.JWT.secret,
            { expiresIn: config.JWT.expires },
            (error, token) => {
                if (error) {
                    console.log("JWT Error: " + error);
                    return res.status(500).json({ message: "Error creating token" });
                }

                // Configurar cookie para producción (cross-domain)
                res.cookie("authToken", token, {
                    httpOnly: true,
                    secure: true, // HTTPS requerido en producción
                    sameSite: 'none', // Permitir cookies cross-site
                    maxAge: 24 * 60 * 60 * 1000, // 24 horas
                    path: '/'
                });

                res.json({ message: "Employee registered" });
            }
        );
    } catch (error) {
        console.log("Register Employee Error: " + error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export default registerEmployeeController;