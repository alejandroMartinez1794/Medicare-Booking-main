import { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const GoogleAuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useContext(authContext);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);

    const token = queryParams.get('token');
    const user = queryParams.get('user');

    if (token && user) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(user));

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: parsedUser,
            token,
            role: parsedUser.role,
          },
        });

        // ✅ GUARDAR EL TOKEN EN LOCALSTORAGE
        localStorage.setItem('token', token);

        toast.success('Login con Google exitoso ✅');

        // ✅ Redirigir al dashboard según el rol del usuario
        if (parsedUser.role === 'paciente') {
          navigate('/users/profile/me');
        } else if (parsedUser.role === 'doctor') {
          navigate('/doctors/profile/me');
        } else {
          navigate('/home');
        }

      } catch (err) {
        toast.error('No se pudo procesar la autenticación de Google');
        console.error('Error parseando usuario:', err);
        navigate('/login');
      }
    } else {
      toast.error('Faltan datos de autenticación');
      navigate('/login');
    }
  }, [location.search, dispatch, navigate]);

  return <p className="text-center text-lg mt-10">Procesando autenticación con Google...</p>;
};

export default GoogleAuthRedirect;
