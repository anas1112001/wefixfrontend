// Title component for different heading levels
import React from 'react';

interface TitleProps {
  children: React.ReactNode;
  className?: string;
  level: '1' | '2' | '3' | '4' | '5' | '6';
}

const Title: React.FC<TitleProps> = ({ children, className, level }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return <Tag className={className}>{children}</Tag>;

};

export default Title;
