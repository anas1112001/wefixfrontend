import React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
  type?: 'button' | 'submit' | 'reset'; 
};

const Button = ({ children,className = '' , onClick, type = 'button',  }: ButtonProps) => (
  <button type={type} onClick={onClick} className={`btn ${className}`}>
    {children}
  </button>
);

export default Button;
