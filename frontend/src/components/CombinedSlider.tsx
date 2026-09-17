// src/components/CombinedSlider.tsx
import React from 'react'
import Slider from 'react-slick'
import { useNavigate } from 'react-router-dom'
import { FaHandsHelping, FaTicketAlt } from 'react-icons/fa'

import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

interface CombinedSliderProps {
  images?: string[]
  interval?: number
}

export const CombinedSlider: React.FC<CombinedSliderProps> = ({
  images = [
    '/img/01.jpg',
    '/img/02.jpg',
    '/img/03.png',
    '/img/04.png',
    '/img/05.png',
  ],
  interval = 10_000,
}) => {
   const navigate = useNavigate();

  const actionSlides = [
    {
      type: 'action' as const,
      icon: <FaHandsHelping className="text-6xl text-indigo-500 mb-4" />,
      title: '¿Necesitas ayuda?',
      desc: 'Crea una nueva solicitud y el equipo de soporte te atenderá.',
      btnText: 'Pedir Ayuda',
      btnColor: 'bg-indigo-600 hover:bg-indigo-700',
      onClick: () => navigate('/dashboard-employee/request-help'),
    },
    {
      type: 'action' as const,
      icon: <FaTicketAlt className="text-6xl text-green-500 mb-4" />,
      title: 'Mis Tickets',
      desc: 'Consulta el estado de tus solicitudes enviadas.',
      btnText: 'Ver Mis Tickets',
      btnColor: 'bg-green-600 hover:bg-green-700',
      onClick: () => navigate('/dashboard-employee/mis-tickets'),
    },
  ];


  const slides = [
    ...images.map(src => ({ type: 'image' as const, src })),
    ...actionSlides,
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: interval,
    pauseOnHover: true,
    adaptiveHeight: false,
  };

  return (
    <div
      className="mx-auto my-8"
      style={{ width: '70%' }}         
    >
      <Slider {...settings}>
        {slides.map((s, idx) => (
          <div key={idx} className="w-full h-[70vh]">
            {s.type === 'image' ? (
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={s.src}
                  alt={`slide-${idx}`}
                  className="w-full h-full object-contain rounded-lg"
                  
                />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-lg shadow-lg p-6">
                {s.icon}
                <h3 className="text-2xl font-semibold mb-2">{s.title}</h3>
                <p className="text-gray-600 mb-4 text-center">{s.desc}</p>
                <button
                  onClick={s.onClick}
                  className={`${s.btnColor} text-white px-6 py-2 rounded`}
                >
                  {s.btnText}
                </button>
              </div>
            )}
          </div>
        ))}
      </Slider>
    </div>
  );
};
