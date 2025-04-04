import React, { useContext } from 'react';
import { BiMenu } from 'react-icons/bi';
import { authContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Tabs = ({ tab, setTab }) => {
    const { dispatch } = useContext(authContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/');
    };

    return (
        <div>
            <span className='lg:hidden'>
                <BiMenu className='w-6 h-6 cursor-pointer' />
            </span>
            <div className='hidden lg:flex flex-col p-[30px] bg-white shadow-panelShadow items-center h-max rounded-md'>
                
                {/* Botón Overview */}
                <button
                    onClick={() => setTab('overview')}
                    className={`${
                        tab === 'overview'
                            ? 'bg-indigo-100 text-primaryColor'
                            : 'bg-transparent text-headingColor'
                    } w-full btn mt-0 rounded-md`}
                >
                    Overview
                </button>

                {/* Botón Appointments */}
                <button
                    onClick={() => setTab('appointments')}
                    className={`${
                        tab === 'appointments'
                            ? 'bg-indigo-100 text-primaryColor'
                            : 'bg-transparent text-headingColor'
                    } w-full btn mt-0 rounded-md`}
                >
                    Appointments
                </button>

                {/* Botón Profile */}
                <button
                    onClick={() => setTab('settings')}
                    className={`${
                        tab === 'settings'
                            ? 'bg-indigo-100 text-primaryColor'
                            : 'bg-transparent text-headingColor'
                    } w-full btn mt-0 rounded-md`}
                >
                    Profile
                </button>

                {/* Nuevo Botón para la Nueva Funcionalidad */}
                <button
                    onClick={() => setTab('new-feature')}
                    className={`${
                        tab === 'new-feature'
                            ? 'bg-indigo-100 text-primaryColor'
                            : 'bg-transparent text-headingColor'
                    } w-full btn mt-0 rounded-md`}
                >
                        Doctor Insights
                </button>

                <div className='mt-[100px] w-full'>
                    {/* Botón Logout */}
                    <button 
                        onClick={handleLogout}
                        className='w-full bg-[#181A1E] p-3 text-[16px] leading-7 rounded-md text-white'
                    >
                        Logout
                    </button>

                    {/* Botón Delete Account */}
                    <button className='w-full bg-red-600 mt-4 p-3 text-[16px] leading-7 rounded-md text-white'>
                        Delete Account
                    </button>     
                </div>
            </div>
        </div>
    );
};

export default Tabs;