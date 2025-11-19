// components/Molecules/Burger/Burger.tsx
import React, { FC, useState } from 'react';

import Container from 'components/Atoms/Container/Container';
import BurgerStyles from 'components/Molecules/Burger/Burger.module.css';
import Paragraph from 'components/Atoms/Paragraph/Paragraph';
import NavList from 'components/Atoms/NavList/NavList'; // Import NavList component
import NavItem from 'components/Atoms/NavItem/NavItem'; // Import NavItem component
import { appText } from 'data/appText';

const Burger: FC = () => {
  const [isActive, setIsActive] = useState<boolean>(false);

  return (
    <Container className={BurgerStyles.burgerWrapper}>
      <Container className={BurgerStyles.menuWrapper}>
        <Paragraph className={BurgerStyles.name} >{appText.menu.label}</Paragraph>
        <Container
          className={isActive ? BurgerStyles.change : BurgerStyles.barsWrapper}
          onClick={() => setIsActive(!isActive)}
          data-testid="bars"
        >
          <div className={BurgerStyles.bar1} />
          <div className={BurgerStyles.bar2} />
          <div className={BurgerStyles.bar3} />
        </Container>
      </Container>

      {isActive && (
        <NavList isInFooter={false}>
          {appText.navItems.map((el, idx) => (
            <NavItem key={el} link={`/${appText.links[idx]}`} label={el} />
          ))}
        </NavList>
      )}
    </Container>
  );
};

export default Burger;
