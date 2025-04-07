import express from 'express';
import { createBooking } from '../Controllers/bookingController.js';
import { authenticate  } from '../auth/verifyToken.js';

const router = express.Router();

// Ruta protegida para crear cita
router.post('/', authenticate , createBooking);

export default router;
