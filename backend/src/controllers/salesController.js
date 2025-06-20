/**
     Collection: Sales
     product
     category
     customer
     total
     date 

 */

import { trusted } from "mongoose";
import salesModel from "../models/Sales.js";

//Array de funciones vacias
const salesController = {};

//=====================
//Ventas por categoría
//=====================

salesController.getSalesByCategory = async (req, res) => {
    try {
        
        const result = await salesModel.aggregate(
            [
                {
                    $group:{
                        _id: "$category",
                        totalVentas: { $sum: "$total" },

                    }
                },
                //Ordenar los resultados 
                {
                    $sort: { totalVentas: -1 }
                }
            ]
        )

        res.status(200).json(result);
    } catch (error) {
        console.log("error" + error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//=====================
//PRODUCTOS MÁS VENDIDOS
//=====================

salesController.getBestSellingProducts = async (req, res) => {
    try {
        const result = await salesModel.aggregate(
            [
                {
                    $group: {
                        _id: "$product",
                        cantidadVendida: { $sum: 1 }
                    }
                },
                //Ordenar los resultados
                {
                    $sort: { cantidadVendida: -1 }
                },
                //Limitar la cantidad de datos a mostrar
                {
                    $limit: 5
                }
            ]
        )
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

//=====================
//CLIENTES CON MÁS COMPRAS
//=====================

salesController.frequentCustomers = async (req, res) => {
    try {
        const result = await salesModel.aggregate(
            [
                {
                    $group:{
                        _id: "$custtomer",
                        comprasRealizadas: { $sum: 1 }
                    }
                },
                //Ordenar los resultados
                {
                    $sort: { comprasRealizadas: -1 }
                },
                //limitar
                {
                    $limit: 5
                }
            ]
        )

        res.status(200).json(result);
    } catch (error) {
        console.log("error" + error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//=====================
//GANANCIAS TOTALES
//=====================

salesController.totalEarnings = async (req, res) => {
    try {
       const result = await salesModel.aggregate(
            [
                {
                    $group: {
                        _id: null,
                        totalGanancias: { $sum: "$total" }
                    }
                },
                //Ordenar los resultados
                {
                    $sort: { totalGanancias: -1 }
                }
            ]
        )

        res.status(200).json(result);
    } catch (error) {
        console.log("error" + error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//=====================
//VENTAS POR FECHA
//=====================

salesController.getSalesByDate = async (req, res) => {
    try {
        
        const result = await salesModel.aggregate(
            [
                {
                    $group:{
                        _id: {
                            anio: {$year: "$fecha"},
                            mes: {$month: "$fecha"},
                        },
                        totalVentas: { $sum: "$total" }
                    }
                },
                //Ordenar los resultados
                {
                    $sort: {totalVentas: -1}
                }
            ]
        );

        res.status(200).json(result);
    } catch (error) {
        console.log("error" + error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//=====================
//AGREGAR VENTAS    
//=====================

salesController.insertSales = async (req, res) => {
    const { product, category, customer, total, date } = req.body;
    try {
        const newSale = new salesModel({
            product,
            category,
            customer,
            total,
            date
        });

        await newSale.save();
        res.status(200).json({ message: "Sale added successfully" });
    } catch (error) {
        console.log("error" + error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export default salesController;