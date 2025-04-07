// backend/Controllers/calendarController.js

import oAuth2Client from '../config/google.js';
import { google } from 'googleapis';

// Redirige al usuario al consentimiento de Google
export const getGoogleAuthUrl = (req, res) => {
  const scopes = ['https://www.googleapis.com/auth/calendar'];
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
  res.redirect(url);
};

// Maneja el callback de Google con el código de autorización
export const handleGoogleCallback = async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    res.send('✅ Autenticación con Google Calendar exitosa');
  } catch (err) {
    console.error('Error en la autenticación:', err);
    res.status(500).json({ error: 'Falló la autenticación con Google.' });
  }
};

// Crea un evento en Google Calendar
export const createCalendarEvent = async (req, res) => {
  const { summary, description, startTime, endTime } = req.body;

  try {
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    const event = {
      summary,
      description,
      start: { dateTime: startTime, timeZone: 'America/Bogota' },
      end: { dateTime: endTime, timeZone: 'America/Bogota' },
    };

    const result = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    res.status(201).json({ message: 'Evento creado', event: result.data });
  } catch (err) {
    console.error('Error al crear evento:', err);
    res.status(500).json({ error: 'No se pudo crear el evento' });
  }
};
