import React, { FC } from 'react';

interface HeadingProps {
  children: React.ReactNode;
  className?: string;
  level: '1' | '2' | '3' | '4' | '5' | '6';
  onClick?: any; 
}

const Heading: FC<HeadingProps> = ({ children, className, level, onClick }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return <Tag className={className} onClick={onClick}>{children}</Tag>;
};

export default Heading;
