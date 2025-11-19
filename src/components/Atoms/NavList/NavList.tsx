import React from 'react';
import styles from 'components/Molecules/Navbar/Navbar.module.css';

interface NavListProps {
  children: React.ReactNode;
  isInFooter: boolean;
}

const NavList: React.FC<NavListProps> = ({ children, isInFooter }) => (
  <ul className={isInFooter ? styles.navbarList : styles.nonFooterNavbarList} data-testid="navbarList">
    {children}
  </ul>
);

export default NavList;
