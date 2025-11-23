import React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick: () => void;
  type?: 'button' | 'submit' | 'reset'; 
};

const Button = ({ children,className = '' , disabled = false, onClick, type = 'button',  }: ButtonProps) => (
  <button disabled={disabled} type={type} onClick={onClick} className={`btn ${className}`}>
    {children}
  </button>
);

export default Button;
