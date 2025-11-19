import Container from 'components/Atoms/Container/Container';
import React, { FC } from 'react';

interface ContactInfoItemProps {
  className?: string;
  icon: React.ReactNode; 
  text: string;
}

const ContactInfoItem: FC<ContactInfoItemProps> = ({ className, icon, text }) => (
  <Container className={className}>
    {icon} {text}
  </Container>
);

export default ContactInfoItem;
