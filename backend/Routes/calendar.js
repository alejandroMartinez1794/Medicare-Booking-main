// backend/Routes/calendar.js

import express from 'express';
import {
  getGoogleAuthUrl,
  handleGoogleCallback,
  createCalendarEvent,
  getCalendarEvents,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '../Controllers/calendarController.js';

const router = express.Router();

// Ruta para redirigir al consentimiento de Google
router.get('/google', getGoogleAuthUrl);

// Callback después de que el usuario autoriza acceso a su Google Calendar
router.get('/google/callback', handleGoogleCallback);

// Ruta para crear un evento en el Google Calendar del usuario autenticado
router.post('/calendar/create', createCalendarEvent);

// 🔽 Nuevas rutas añadidas 🔽

// Obtener eventos próximos del calendario
router.get('/calendar/events', getCalendarEvents);

// Actualizar evento existente (requiere `eventId` y nuevos datos)
router.put('/calendar/update', updateCalendarEvent);

// Eliminar evento por ID
router.delete('/calendar/delete/:eventId', deleteCalendarEvent);

// Ruta para manejar el callback de Google OAuth2


router.get('/auth/google/callback', handleGoogleCallback);


export default router;
