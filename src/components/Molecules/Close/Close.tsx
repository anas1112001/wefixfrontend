import { appText } from 'data/appText';
import { FC } from 'react';

import Container from 'components/Atoms/Container/Container';
import CloseStyles from 'components/Molecules/Close/Close.module.css';
import Image from 'components/Atoms/Image/Image'; // Import the Image component

interface IAddMoreProps {
  handleClose?: (timeout?: number) => void;
}

const Close: FC<IAddMoreProps> = ({ handleClose }) => (
  <Container className={CloseStyles.closeWrapper}>
    <Image
      alt={appText.close.alt}
      className={CloseStyles.closeImage}
      onClick={() => handleClose && handleClose()}
      src="svg/close.svg"
    />
  </Container>
)

export default Close;
