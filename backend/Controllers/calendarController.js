// backend/Controllers/calendarController.js
import { google } from 'googleapis';
import GoogleToken from '../Models/GoogleTokenSchema.js';
import User from '../Models/UserSchema.js';
import { createJWT } from '../utils/jwt.js';
import oAuth2Client from '../config/google.js';

/**
 * 🔗 Genera URL de autenticación de Google
 */
export const getGoogleAuthUrl = (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });

  res.redirect(url);
};

/**
 * ✅ Callback después de autorización de Google
 */
export const handleGoogleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oAuth2Client, version: 'v2' });
    const { data: userInfo } = await oauth2.userinfo.get();
    const { email, name, picture } = userInfo;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        role: 'paciente',
        authProvider: 'google',
        profilePicture: picture,
      });
    }

    const token = createJWT({ id: user._id, role: user.role });

    await GoogleToken.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scope: tokens.scope,
        token_type: tokens.token_type,
        expiry_date: tokens.expiry_date,
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      message: '✅ Autenticación con Google exitosa',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture || null,
      },
    });
  } catch (error) {
    console.error('🔴 Error en handleGoogleCallback:', error);
    return res.status(500).json({ error: 'Error en la autenticación con Google' });
  }
};

/**
 * 🗓️ Crear evento en Google Calendar
 */
export const createCalendarEvent = async ({ body }) => {
  try {
    const { userId, summary, description, startTime, endTime } = body;

    const userTokens = await GoogleToken.findOne({ userId });
    if (!userTokens) {
      return { success: false, error: 'Tokens no encontrados para el usuario' };
    }

    const oAuth2Client = new google.auth.OAuth2();
    oAuth2Client.setCredentials({
      access_token: userTokens.access_token,
      refresh_token: userTokens.refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary,
        description,
        start: { dateTime: startTime },
        end: { dateTime: endTime },
      },
    });

    return {
      success: true,
      event: response.data, // contiene `.id`, `.htmlLink`, etc.
    };

  } catch (error) {
    console.error('❌ Error al crear evento en Google Calendar:', error);
    return { success: false, error: 'Error al crear el evento en Google Calendar' };
  }
};

/**
 * 📅 Obtener eventos
 */
export const getCalendarEvents = async (req, res) => {
  try {
    const userId = req.user.id;

    const tokenDoc = await GoogleToken.findOne({ userId });
    if (!tokenDoc) return res.status(404).json({ error: 'Token de Google no encontrado' });

    oAuth2Client.setCredentials({
      access_token: tokenDoc.access_token,
      refresh_token: tokenDoc.refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    res.status(200).json({ events: response.data.items });
  } catch (error) {
    console.error('❌ Error al obtener eventos:', error);
    res.status(500).json({ error: 'No se pudieron obtener los eventos' });
  }
};

/**
 * ✏️ Actualizar evento
 */
export const updateCalendarEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId, summary, description, startTime, endTime } = req.body;

    const tokenDoc = await GoogleToken.findOne({ userId });
    if (!tokenDoc) return res.status(404).json({ error: 'Token no encontrado' });

    oAuth2Client.setCredentials({
      access_token: tokenDoc.access_token,
      refresh_token: tokenDoc.refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    const updatedEvent = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      resource: {
        summary,
        description,
        start: { dateTime: startTime, timeZone: 'America/Bogota' },
        end: { dateTime: endTime, timeZone: 'America/Bogota' },
      },
    });

    res.status(200).json({ message: 'Evento actualizado', event: updatedEvent.data });
  } catch (error) {
    console.error('❌ Error al actualizar evento:', error);
    res.status(500).json({ error: 'No se pudo actualizar el evento' });
  }
};

/**
 * 🗑️ Eliminar evento
 */
export const deleteCalendarEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;

    const tokenDoc = await GoogleToken.findOne({ userId });
    if (!tokenDoc) return res.status(404).json({ error: 'Token no encontrado' });

    oAuth2Client.setCredentials({
      access_token: tokenDoc.access_token,
      refresh_token: tokenDoc.refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });

    res.status(200).json({ message: 'Evento eliminado' });
  } catch (error) {
    console.error('❌ Error al eliminar evento:', error);
    res.status(500).json({ error: 'No se pudo eliminar el evento' });
  }
};
