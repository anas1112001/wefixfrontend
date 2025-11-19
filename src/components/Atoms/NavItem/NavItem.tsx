import React from 'react';
import { Link } from 'react-router-dom';

interface NavItemProps {
  label: string;
  link: string;
}

const NavItem: React.FC<NavItemProps> = ({ label, link }) => (
  <li data-testid="listitem">
    <Link to={link}>{label}</Link>
  </li>
);

export default NavItem;
