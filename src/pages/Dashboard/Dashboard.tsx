import React, { FC } from 'react';
import Container from 'components/Atoms/Container/Container';
import Heading from 'components/Atoms/Heading/Heading';
import Paragraph from 'components/Atoms/Paragraph/Paragraph';
import Sidebar from 'components/Molecules/Sidebar/Sidebar';
import AppHeader from 'components/Organisms/AppHeader/AppHeader';
import MetricCard from 'components/Molecules/MetricCard/MetricCard';
import { appText } from 'data/appText';
import styles from './Dashboard.module.css';

const Dashboard: FC = () => (
  <Container className={styles.dashboardLayout}>
    <AppHeader />
    <Container className={styles.contentWrapper}>
      <Sidebar />
      <Container className={styles.mainContent}>
      <Heading className={styles.pageTitle} level="1">
        {appText.dashboard.title}
      </Heading>

      <Container className={styles.welcomeSection}>
        <Heading className={styles.welcomeTitle} level="2">
          {appText.dashboard.welcomeTitle}
        </Heading>
        <Paragraph className={styles.welcomeSubtitle}>
          {appText.dashboard.welcomeSubtitle}
        </Paragraph>
      </Container>

      <Container className={styles.metricsGrid}>
        <MetricCard color="orange" title={appText.dashboard.metrics.totalTickets} value="156" />
        <MetricCard color="green" title={appText.dashboard.metrics.activeTickets} value="42" />
        <MetricCard color="orange" title={appText.dashboard.metrics.customers} value="89" />
        <MetricCard color="red" title={appText.dashboard.metrics.thisMonth} value="24" />
      </Container>
    </Container>
    </Container>
  </Container>
);

export default Dashboard;
