import React from 'react';
import './Components.css';

// Usamos 'variant' para los colores y extendemos las props del botón
interface PunchyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'dark';
  children: React.ReactNode;
}

export const PunchyButton = ({ 
  variant = 'primary', // Por defecto es primary
  children, 
  className = '', 
  style, 
  ...props 
}: PunchyButtonProps) => {
  return (
    <button 
      // Usamos la variante para la clase CSS
      className={`btn-punchy btn-${variant} ${className}`} 
      style={style}
      {...props}
    >
      {children}
    </button>
  );
};