import React, { FC } from 'react';
import Container from 'components/Atoms/Container/Container';
import Heading from 'components/Atoms/Heading/Heading';
import Paragraph from 'components/Atoms/Paragraph/Paragraph';
import styles from './MetricCard.module.css';

interface MetricCardProps {
  color: 'green' | 'orange' | 'red';
  title: string;
  value: string | number;
}

const MetricCard: FC<MetricCardProps> = ({ color, title, value }) => (
  <Container className={`${styles.metricCard} ${styles[color]}`}>
    <Heading className={styles.cardTitle} level="3">
      {title}
    </Heading>
    <Paragraph className={styles.cardValue}>{value}</Paragraph>
  </Container>
);

export default MetricCard;
