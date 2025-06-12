/*
   Collection name: Faqs

   Fields:
       Question
       Answer
       Level
       isActive

 */
import Faqs from "../models/Faqs.js";

//1- Creo un array de funciones vacio

const faqsController = {};

//SELECT
faqsController.getAllFaqs = async (req, res) => {
    try {

        const faqs = await Faqs.find();
        res.status(200).json(faqs);

    } catch (error) {
        console.log("este es el error: " + error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//INSERT
faqsController.insertFaq = async (req, res) => {
    //1- Pedir las cosas que necesito
    const { question, answer, level, isActive } = req.body;

    try {
        
        //Vallidar si no hay campos vacios
        if (!question || !answer || !level || isActive === undefined) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if(level < 1 || level > 10) {
            return res.status(400).json({ message: "Level must be between 1 and 10" });
        }

        if(question.lenght < 4 || answer.lenght < 4) {
            return res.status(400).json({ message: "Question and answer must be at least 4 characters long" });
        }

        //Guardemos en la base de datos
        const newFaq = new Faqs({
            question,
            answer,
            level,
            isActive
        });

        newFaq.save();0

        res.status(200).json({ message: "FAQ created successfully" });
    } catch (error) {
        console.log("Error: " + error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

//UPDATE
faqsController.updateFaq = async (req, res) => {

    //-1 Pedir las cosas que necesito
    const { question, answer, level, isActive } = req.body;
    try {

        //Validaciones 
        if(level < 1 || level > 10) {
            return res.status(400).json({ message: "Level must be between 1 and 10" });
        }

        if(question.lenght < 4 || answer.lenght < 4) {
            return res.status(400).json({ message: "Question and answer must be at least 4 characters long" });
        }

        const updatedFaq = await Faqs.findByIdAndUpdate(
            req.params.id,
            {
                question,
                answer,
                level,
                isActive
            },
            { new: true }
        );

        if (!updatedFaq) {
            return res.status(404).json({ message: "FAQ not found" });
        }

        res.status(200).json({ message: "FAQ updated successfully", updatedFaq });
    } catch (error) {
        console.log("Error: " + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//DELETE
faqsController.deleteFaq = async (req, res) => {
    try {
        const deleteFaq = await Faqs.findByIdAndDelete(req.params.id);

        if (!deleteFaq) {
            return res.status(404).json({ message: "Not found" });
        }

        res.status(200).json({ message: "FAQ deleted successfully" });
    } catch (error) {
        console.log("Error: " + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//SELECT BY ID
faqsController.getFaqById = async (req, res) => {
    try {
        
        const faqs = await Faqs.findById(req.params.id);
        if (!faqs) {
            return res.status(404).json({ message: "FAQ not found" });
        }

        res.status(200).json(faqs);
    } catch (error) {
        console.log("Error: " + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export default faqsController;