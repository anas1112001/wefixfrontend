import React, { FC, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Container from 'components/Atoms/Container/Container';
import Heading from 'components/Atoms/Heading/Heading';
import Paragraph from 'components/Atoms/Paragraph/Paragraph';
import { appText } from 'data/appText';
import styles from './Sidebar.module.css';

interface NavItem {
  badge?: string | number;
  icon?: string;
  label: string;
  path: string;
  subItems?: NavItem[];
}

const Sidebar: FC = () => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navItems: NavItem[] = [
    { icon: 'fas fa-chart-line', label: appText.sidebar.navItems.dashboard, path: '/dashboard' },
    { badge: '17', icon: 'fas fa-calendar', label: appText.sidebar.navItems.calendar, path: '/calendar' },
    { icon: 'fas fa-ticket-alt', label: appText.sidebar.navItems.tickets, path: '/tickets' },
    {
      icon: 'fas fa-users',
      label: appText.sidebar.navItems.customers,
      path: '/customers',
      subItems: [
        { label: appText.sidebar.navItems.companies, path: '/customers/companies' },
        { label: appText.sidebar.navItems.individuals, path: '/customers/individuals' },
      ],
    },
    { icon: 'fas fa-file-contract', label: appText.sidebar.navItems.contracts, path: '/contracts' },
    { icon: 'fas fa-lock', label: appText.sidebar.navItems.roles, path: '/roles' },
  ];

  const toggleSubItems = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Container className={styles.sidebar}>
      <Container className={styles.sidebarHeader}>
        <Heading className={styles.logo} level="2">
          {appText.sidebar.brandName}
        </Heading>
        <Link className={styles.loginLink} to="/login">
          {appText.sidebar.login}
        </Link>
      </Container>

      <Container className={styles.navContainer}>
        {navItems.map((item) => (
          <Container key={item.label} className={styles.navItemWrapper}>
            <Link
              className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
              onClick={() => item.subItems && toggleSubItems(item.label)}
              to={item.path}
            >
              {item.icon && <i className={item.icon}></i>}
              <Paragraph className={styles.navLabel}>{item.label}</Paragraph>
              {item.badge && <Container className={styles.badge}>{item.badge}</Container>}
              {item.subItems && (
                <Paragraph className={styles.expandIcon}>
                  {expandedItems.includes(item.label) ? '▼' : '▶'}
                </Paragraph>
              )}
            </Link>
            {item.subItems && expandedItems.includes(item.label) && (
              <Container className={styles.subItems}>
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.label}
                    className={`${styles.subItem} ${isActive(subItem.path) ? styles.active : ''}`}
                    to={subItem.path}
                  >
                    <Paragraph className={styles.subItemLabel}>{subItem.label}</Paragraph>
                  </Link>
                ))}
              </Container>
            )}
          </Container>
        ))}
      </Container>
    </Container>
  );
};

export default Sidebar;
