import React from 'react';
import Container from 'components/Atoms/Container/Container';
import NavList from 'components/Atoms/NavList/NavList';
import NavItem from 'components/Atoms/NavItem/NavItem';
import { appText } from 'data/appText';
import { useViewport } from 'hooks/useViewport';

function Navbar({ isInFooter }) {
  const viewport = useViewport();

  return (
    <>
      {viewport === 'extra-large' && (
        <Container className="navbarWrapper">
          <NavList isInFooter={isInFooter}>
            {appText.navItems.map((item, idx) => (
              <NavItem key={item} link={`/${appText.links[idx]}`} label={item} />
            ))}
          </NavList>
        </Container>
      )}
    </>
  );
}

export default Navbar;
