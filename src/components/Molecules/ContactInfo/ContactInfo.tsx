import React, { FC } from 'react';
import styles from './ContactInfo.module.css';
import ContactInfoItem from '../ContactInfoItem/ContactInfoItem';
import Container from 'components/Atoms/Container/Container';

interface ContactInfoProps {
  info: {  icon: React.ReactNode; text: string,}[];
}

const ContactInfo: FC<ContactInfoProps> = ({ info }) => (
  <Container className={styles.contactInfo}>
    {info.map((item, index) => (
      <ContactInfoItem key={index} icon={item.icon} text={item.text} className={styles.contactInfoItem} />
    ))}
  </Container>
);

export default ContactInfo;
