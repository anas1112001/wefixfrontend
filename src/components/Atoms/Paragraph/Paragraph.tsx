import React, { FC } from 'react';

interface ParagraphProps {
  children: React.ReactNode;
  className?: string;
}

const Paragraph: FC<ParagraphProps> = ({ children, className }) => (
  <p className={className}>{children}</p>
);

export default Paragraph;
