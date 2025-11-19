import Button from 'components/Atoms/Button/Button';
import Image from 'components/Atoms/Image/Image';
import Paragraph from 'components/Atoms/Paragraph/Paragraph';
import Title from 'components/Atoms/Title/Title';
import React from 'react';
import styles from './Card.module.css';
import Container from 'components/Atoms/Container/Container';

interface CardProps {
  buttonText: string;
  imageSrc: string;
  onButtonClick: () => void;
  subtitle: string;
  title: string;
}

const Card: React.FC<CardProps> = ({ buttonText, imageSrc, onButtonClick, subtitle, title }) =>
(
  <Container className={styles.cardWrapper}>
    <Image src={imageSrc} alt={title} className={styles.cardImage} />
    <Container className={styles.cardContent}>
      <Title className={styles.cardTitle} level="3">{title}</Title>
      <Paragraph className={styles.cardDescription} >{subtitle}</Paragraph>
    </Container>
      <Button className={styles.cardButton} onClick={onButtonClick}>{buttonText}</Button>
  </Container>
);


export default Card;
