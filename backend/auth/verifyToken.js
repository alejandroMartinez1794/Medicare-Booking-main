// backend/auth/verifyToken.js
import jwt from 'jsonwebtoken';
import Doctor from '../models/DoctorSchema.js';
import User from '../Models/UserSchema.js';

// ✅ Middleware para verificar el token JWT
export const authenticate = async (req, res, next) => {
  const authToken = req.headers.authorization;

  if (!authToken || !authToken.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }

  try {
    const token = authToken.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = decoded; // contiene { id, role }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// ✅ Middleware para restringir rutas por rol
export const restrict = (roles) => async (req, res, next) => {
  const userId = req.user.id; // usamos "id", no "_id"
  const userRole = req.user.role;

  // Si quieres validar que el usuario existe en la base de datos:
  const user = await User.findById(userId) || await Doctor.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
  }

  if (!roles.includes(userRole)) {
    return res.status(403).json({ success: false, message: 'You are not authorized' });
  }

  next();
};
