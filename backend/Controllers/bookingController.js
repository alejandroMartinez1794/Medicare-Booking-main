import Booking from '../models/BookingSchema.js';
import { createGoogleCalendarEvent } from './calendarController.js';

/**
 * Crea una nueva reserva y agenda un evento en Google Calendar automáticamente
 */
export const createBooking = async (req, res) => {
  const { userId, doctorId, appointmentDate, appointmentTime, reason } = req.body;

  try {
    // 🧠 1. Crear la reserva en la base de datos
    const newBooking = new Booking({
      user: userId,
      doctor: doctorId,
      date: appointmentDate,
      time: appointmentTime,
      reason,
    });

    const savedBooking = await newBooking.save();

    // ⏰ 2. Convertir fecha y hora a formato ISO para Google Calendar
    const startDateTime = new Date(`${appointmentDate}T${appointmentTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000); // cita de 30 minutos

    // 📅 3. Crear evento en Google Calendar
    const calendarEvent = await createGoogleCalendarEvent({
      summary: `Cita médica con el Dr./Dra.`,
      description: reason || 'Consulta médica programada desde el sistema Medicare Booking',
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
    });

    console.log('🗓️ Evento creado en Google Calendar:', calendarEvent.id);

    res.status(201).json({
      message: 'Reserva creada y evento sincronizado con Google Calendar',
      booking: savedBooking,
      calendarEventId: calendarEvent.id,
    });
  } catch (error) {
    console.error('❌ Error al crear la reserva:', error);
    res.status(500).json({ error: 'No se pudo crear la reserva' });
  }
};
