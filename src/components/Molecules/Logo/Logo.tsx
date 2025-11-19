import { appText } from 'data/appText';
import { FC } from 'react';

import Container from 'components/Atoms/Container/Container';
import LogoStyles from 'components/Molecules/Logo/Logo.module.css';
import Image from 'components/Atoms/Image/Image'; // Import the Image component

interface ILogoProps {
  testId?: string;
}

const Logo: FC<ILogoProps> = ({ testId }) => (
  <Container className={LogoStyles.logoWrapper} testId={testId}>
    <Image
      alt={appText.logo.alt}
      className={LogoStyles.headerLogo}
      src="svg/logo.svg"
    />
  </Container>
)

export default Logo;
