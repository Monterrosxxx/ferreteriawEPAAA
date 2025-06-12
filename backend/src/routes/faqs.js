import express from 'express';
import faqsController from '../controllers/faqsController.js';

const router = express.Router(); 

router.route('/')
    .get(faqsController.getAllFaqs) 
    .post(faqsController.insertFaq); 

router.route('/:id')
    .get(faqsController.getFaqById) 
    .put(faqsController.updateFaq) 
    .delete(faqsController.deleteFaq); 

export default router;