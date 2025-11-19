import React, { FC } from 'react';

interface HeadingProps {
  children: React.ReactNode;
  className?: string;
  level?: '1' | '2' | '3' | '4' | '5' | '6'; // Allows flexibility for different heading levels
}

const Heading: FC<HeadingProps> = ({ children, className, level='2', }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return <Tag className={className}>{children}</Tag>;
};

export default Heading;
