import jwt from 'jsonwebtoken';
import Doctor from '../models/DoctorSchema.js';
import User from '../Models/UserSchema.js';

// Middleware para verificar el token JWT
export const authenticate = async (req, res, next) => {
  const authToken = req.headers.authorization;

  if (!authToken || !authToken.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }

  try {
    const token = authToken.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = decoded;        // Guardamos el payload completo del token
    req.role = decoded.role;   // Acceso directo al rol

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }

    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Middleware para restringir el acceso según el rol (paciente o doctor)
export const restrict = (roles) => async (req, res, next) => {
  const userId = req.user._id; // Asegúrate de firmar el token con _id

  let user;
  const patient = await User.findById(userId);
  const doctor = await Doctor.findById(userId);

  if (patient) user = patient;
  if (doctor) user = doctor;

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'You are not authorized' });
  }

  next();
};
