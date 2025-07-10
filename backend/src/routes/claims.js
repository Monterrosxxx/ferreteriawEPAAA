import express from 'express';
import claimsController from '../controllers/claimsController.js';

const router = express.Router();

// Rutas principales
router.route("/")
    .get(claimsController.getClaims)
    .post(claimsController.createClaim);

// Rutas por ID
router.route("/:id")
    .get(claimsController.getClaimById)
    .put(claimsController.updateClaim)
    .delete(claimsController.deleteClaim);

// Rutas especiales
router.route("/customer/:customerId")
    .get(claimsController.getClaimsByCustomer);

router.route("/status/:status")
    .get(claimsController.getClaimsByStatus);

export default router;