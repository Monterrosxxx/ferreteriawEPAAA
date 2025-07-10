import claimsModel from "../models/Claims.js";
import clientsModel from "../models/Clients.js";
import productsModel from "../models/Products.js";
import branchesModel from "../models/Branches.js";
import employeesModel from "../models/Employees.js";
import mongoose from "mongoose";

const claimsController = {};

// GET - Obtener todos los claims
claimsController.getClaims = async (req, res) => {
    try {
        const claims = await claimsModel.find()
            .populate('customerId', 'name lastName email')
            .populate('productId', 'name')
            .populate('branchId', 'name address')
            .populate('employeeId', 'name lastName');
        
        res.status(200).json(claims);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// GET BY ID - Obtener claim por ID
claimsController.getClaimById = async (req, res) => {
    try {
        const claim = await claimsModel.findById(req.params.id)
            .populate('customerId', 'name lastName email telephone')
            .populate('productId', 'name description price')
            .populate('branchId', 'name address telephone')
            .populate('employeeId', 'name lastName email');

        if (!claim) {
            return res.status(404).json({ message: "Claim not found" });
        }

        res.status(200).json(claim);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// POST - Crear nuevo claim
claimsController.createClaim = async (req, res) => {
    const { customerId, productId, branchId, employeeId, subject, description, level } = req.body;

    try {
        // Validaciones requeridas
        if (!customerId || !subject || !description) {
            return res.status(400).json({ 
                message: "customerId, subject and description are required" 
            });
        }

        // Validar que customerId sea un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({ message: "Invalid customerId format" });
        }

        // Verificar que el cliente exista
        const customerExists = await clientsModel.findById(customerId);
        if (!customerExists) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // Validar ObjectIds opcionales si se proporcionan
        if (productId) {
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({ message: "Invalid productId format" });
            }
            const productExists = await productsModel.findById(productId);
            if (!productExists) {
                return res.status(404).json({ message: "Product not found" });
            }
        }

        if (branchId) {
            if (!mongoose.Types.ObjectId.isValid(branchId)) {
                return res.status(400).json({ message: "Invalid branchId format" });
            }
            const branchExists = await branchesModel.findById(branchId);
            if (!branchExists) {
                return res.status(404).json({ message: "Branch not found" });
            }
        }

        if (employeeId) {
            if (!mongoose.Types.ObjectId.isValid(employeeId)) {
                return res.status(400).json({ message: "Invalid employeeId format" });
            }
            const employeeExists = await employeesModel.findById(employeeId);
            if (!employeeExists) {
                return res.status(404).json({ message: "Employee not found" });
            }
        }

        // Validar longitud de subject y description
        if (subject.length < 5) {
            return res.status(400).json({ 
                message: "Subject must be at least 5 characters long" 
            });
        }

        if (description.length < 10) {
            return res.status(400).json({ 
                message: "Description must be at least 10 characters long" 
            });
        }

        // Crear nuevo claim
        const newClaim = new claimsModel({
            customerId,
            productId: productId || null,
            branchId: branchId || null,
            employeeId: employeeId || null,
            subject,
            description,
            level: level || 1
        });

        await newClaim.save();
        
        // Populamos el claim antes de enviarlo
        const populatedClaim = await claimsModel.findById(newClaim._id)
            .populate('customerId', 'name lastName email')
            .populate('productId', 'name')
            .populate('branchId', 'name')
            .populate('employeeId', 'name lastName');

        res.status(201).json({
            message: "Claim created successfully",
            claim: populatedClaim
        });

    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// PUT - Actualizar claim
claimsController.updateClaim = async (req, res) => {
    const { customerId, productId, branchId, employeeId, subject, description, status, response, level } = req.body;

    try {
        // Verificar que el claim exista
        const existingClaim = await claimsModel.findById(req.params.id);
        if (!existingClaim) {
            return res.status(404).json({ message: "Claim not found" });
        }

        // Validaciones similares a createClaim
        if (customerId && !mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({ message: "Invalid customerId format" });
        }

        if (customerId) {
            const customerExists = await clientsModel.findById(customerId);
            if (!customerExists) {
                return res.status(404).json({ message: "Customer not found" });
            }
        }

        if (productId) {
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({ message: "Invalid productId format" });
            }
            const productExists = await productsModel.findById(productId);
            if (!productExists) {
                return res.status(404).json({ message: "Product not found" });
            }
        }

        if (branchId) {
            if (!mongoose.Types.ObjectId.isValid(branchId)) {
                return res.status(400).json({ message: "Invalid branchId format" });
            }
            const branchExists = await branchesModel.findById(branchId);
            if (!branchExists) {
                return res.status(404).json({ message: "Branch not found" });
            }
        }

        if (employeeId) {
            if (!mongoose.Types.ObjectId.isValid(employeeId)) {
                return res.status(400).json({ message: "Invalid employeeId format" });
            }
            const employeeExists = await employeesModel.findById(employeeId);
            if (!employeeExists) {
                return res.status(404).json({ message: "Employee not found" });
            }
        }

        // Validar longitudes si se proporcionan
        if (subject && subject.length < 5) {
            return res.status(400).json({ 
                message: "Subject must be at least 5 characters long" 
            });
        }

        if (description && description.length < 10) {
            return res.status(400).json({ 
                message: "Description must be at least 10 characters long" 
            });
        }

        if (response && response.length < 10) {
            return res.status(400).json({ 
                message: "Response must be at least 10 characters long" 
            });
        }

        // Actualizar claim
        const updatedClaim = await claimsModel.findByIdAndUpdate(
            req.params.id,
            {
                ...(customerId && { customerId }),
                ...(productId && { productId }),
                ...(branchId && { branchId }),
                ...(employeeId && { employeeId }),
                ...(subject && { subject }),
                ...(description && { description }),
                ...(status && { status }),
                ...(response && { response }),
                ...(level && { level })
            },
            { new: true }
        ).populate('customerId', 'name lastName email')
         .populate('productId', 'name')
         .populate('branchId', 'name')
         .populate('employeeId', 'name lastName');

        res.status(200).json({
            message: "Claim updated successfully",
            claim: updatedClaim
        });

    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// DELETE - Eliminar claim
claimsController.deleteClaim = async (req, res) => {
    try {
        const deletedClaim = await claimsModel.findByIdAndDelete(req.params.id);
        
        if (!deletedClaim) {
            return res.status(404).json({ message: "Claim not found" });
        }

        res.status(200).json({ message: "Claim deleted successfully" });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// GET - Obtener claims por cliente
claimsController.getClaimsByCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({ message: "Invalid customerId format" });
        }

        const claims = await claimsModel.find({ customerId })
            .populate('productId', 'name')
            .populate('branchId', 'name')
            .populate('employeeId', 'name lastName')
            .sort({ createdAt: -1 });

        res.status(200).json(claims);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// GET - Obtener claims por status
claimsController.getClaimsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        
        const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const claims = await claimsModel.find({ status })
            .populate('customerId', 'name lastName email')
            .populate('productId', 'name')
            .populate('branchId', 'name')
            .populate('employeeId', 'name lastName')
            .sort({ createdAt: -1 });

        res.status(200).json(claims);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export default claimsController;