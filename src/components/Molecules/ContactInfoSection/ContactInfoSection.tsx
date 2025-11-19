import React from 'react';
import Container from 'components/Atoms/Container/Container';
import Heading from 'components/Atoms/Heading/Heading';
import Paragraph from 'components/Atoms/Paragraph/Paragraph';
import ContactInfo from 'components/Molecules/ContactInfo/ContactInfo';
import styles from './ContactInfoSection.module.css';

interface ContactInfoSectionProps {
  contactItems: { icon: React.ReactNode; text: string }[];
  description: string;
  heading: string;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({ contactItems, description, heading }) => (
  <Container className={styles.contactInfoSectionWrapper}>
    <Heading className={styles.heading}>{heading}</Heading>
    <Paragraph className={styles.description}>{description}</Paragraph>
    <ContactInfo info={contactItems} />
  </Container>
);

export default ContactInfoSection;
