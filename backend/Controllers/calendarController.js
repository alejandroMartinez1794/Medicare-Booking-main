// backend/Controllers/calendarController.js

import oAuth2Client from '../config/google.js';
import { google } from 'googleapis';
import GoogleToken from '../models/GoogleTokenSchema.js';

/**
 * Redirige al usuario a la página de consentimiento de Google
 * para otorgar acceso al calendario.
 */
export const getGoogleAuthUrl = (req, res) => {
  const scopes = ['https://www.googleapis.com/auth/calendar'];

  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // Fuerza que se envíe refresh_token
    scope: scopes,
  });

  res.redirect(url);
};

/**
 * Maneja el callback que recibe Google tras el consentimiento del usuario.
 * Obtiene y guarda los tokens (access + refresh) en MongoDB.
 */
export const handleGoogleCallback = async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // TODO: Reemplazar por el ID real del usuario autenticado (middleware de auth)
    const userId = req.user?.id || '6611ea1e508ab5e924c4e7aa'; // temporal

    // Guarda tokens en la base de datos (crea o actualiza)
    await GoogleToken.findOneAndUpdate(
      { userId },
      { ...tokens, userId },
      { upsert: true, new: true }
    );

    res.send('✅ Autenticación con Google Calendar exitosa y tokens almacenados');
  } catch (err) {
    console.error('Error en la autenticación:', err);
    res.status(500).json({ error: 'Falló la autenticación con Google.' });
  }
};

/**
 * Función utilitaria que configura un cliente OAuth2
 * con los tokens recuperados desde la base de datos.
 */
const getOAuthClientWithUserTokens = async (userId) => {
  const tokenData = await GoogleToken.findOne({ userId });

  if (!tokenData) {
    throw new Error('Token de Google no encontrado para este usuario');
  }

  oAuth2Client.setCredentials({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    scope: tokenData.scope,
    token_type: tokenData.token_type,
    expiry_date: tokenData.expiry_date,
  });

  return google.calendar({ version: 'v3', auth: oAuth2Client });
};

/**
 * Función reutilizable para crear un evento en Google Calendar.
 */
export const createGoogleCalendarEvent = async ({ userId, summary, description, startTime, endTime }) => {
  try {
    const calendar = await getOAuthClientWithUserTokens(userId);

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

    return result.data;
  } catch (err) {
    console.error('Error al crear evento desde función utilitaria:', err);
    throw err;
  }
};

/**
 * Ruta API para crear un evento. Usa la función reutilizable.
 */
export const createCalendarEvent = async (req, res) => {
  const { summary, description, startTime, endTime } = req.body;

  // TODO: Reemplazar por el ID real del usuario autenticado
  const userId = req.user?.id || '6611ea1e508ab5e924c4e7aa'; // temporal

  try {
    const data = await createGoogleCalendarEvent({
      userId,
      summary,
      description,
      startTime,
      endTime,
    });

    res.status(201).json({ message: '📆 Evento creado con éxito', event: data });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo crear el evento en Google Calendar' });
  }
};
