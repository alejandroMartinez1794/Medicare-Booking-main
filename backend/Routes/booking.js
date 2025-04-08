import express from 'express';
import { createBooking, cancelBooking } from '../Controllers/bookingController.js';
import { authenticate  } from '../auth/verifyToken.js';

const router = express.Router();

// Ruta protegida para crear cita
router.post('/', authenticate , createBooking);
router.delete('/:bookingId', authenticate, cancelBooking); // 👈 esta es nueva

export default router;
