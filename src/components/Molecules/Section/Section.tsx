import React from 'react';
import styles from './Section.module.css';
import Container from 'components/Atoms/Container/Container';
import Image from 'components/Atoms/Image/Image';
import Heading from 'components/Atoms/Heading/Heading';
import Paragraph from 'components/Atoms/Paragraph/Paragraph';

const Section = ({ description, imageSrc, title }) => (
  <Container className={styles.section}>
    <Image src={imageSrc} alt={title} className={styles.image} />
    <Container className={styles.content}>
      <Heading className={styles.title}>{title}</Heading>
      <Paragraph  className={styles.description}>{description}</Paragraph>
    </Container>
  </Container>
);

export default Section;
