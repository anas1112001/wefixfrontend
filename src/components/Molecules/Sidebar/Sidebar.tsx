import React, { FC, useEffect, useState } from 'react';
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
        { label: appText.sidebar.navItems.companies, path: `/${appText.links[5]}` },
        { label: appText.sidebar.navItems.individuals, path: `/${appText.links[6]}` },
      ],
    },
    { icon: 'fas fa-file-contract', label: appText.sidebar.navItems.contracts, path: `/${appText.links[7]}` },
    { icon: 'fas fa-lock', label: appText.sidebar.navItems.roles, path: '/roles' },
  ];

  // Auto-expand parent items when on a sub-route
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.subItems) {
        const isOnSubRoute = item.subItems.some((subItem) => location.pathname === subItem.path);

        if (isOnSubRoute && !expandedItems.includes(item.label)) {
          setExpandedItems((prev) => [...prev, item.label]);
        }
      }
    });
  }, [location.pathname]);

  const toggleSubItems = (label: string, e: React.MouseEvent) => {
    e.preventDefault();
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  const isParentActive = (item: NavItem) => {
    if (item.subItems) {
      return item.subItems.some((subItem) => location.pathname === subItem.path);
    }

    return location.pathname === item.path;
  };

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
            {item.subItems ? (
              <Container
                className={`${styles.navItem} ${isParentActive(item) ? styles.active : ''}`}
                onClick={(e) => toggleSubItems(item.label, e)}
              >
                {item.icon && <i className={item.icon}></i>}
                <Paragraph className={styles.navLabel}>{item.label}</Paragraph>
                {item.badge && <Container className={styles.badge}>{item.badge}</Container>}
                <Paragraph className={styles.expandIcon}>
                  {expandedItems.includes(item.label) ? '▼' : '▶'}
                </Paragraph>
              </Container>
            ) : (
              <Link
                className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
                to={item.path}
              >
                {item.icon && <i className={item.icon}></i>}
                <Paragraph className={styles.navLabel}>{item.label}</Paragraph>
                {item.badge && <Container className={styles.badge}>{item.badge}</Container>}
              </Link>
            )}
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
