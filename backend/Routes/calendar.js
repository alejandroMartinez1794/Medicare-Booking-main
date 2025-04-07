// backend/Routes/calendar.js

import express from 'express';
import {
  getGoogleAuthUrl,
  handleGoogleCallback,
  createCalendarEvent
} from '../Controllers/calendarController.js';

const router = express.Router();

// Ruta para redirigir al consentimiento de Google
router.get('/google', getGoogleAuthUrl);

// Callback después de que el usuario autoriza acceso a su Google Calendar
router.get('/google/callback', handleGoogleCallback);

// Ruta para crear un evento en el Google Calendar del usuario autenticado
router.post('/calendar/create', createCalendarEvent);

export default router;
