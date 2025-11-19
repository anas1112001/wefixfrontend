import { appText } from 'data/appText';
import { FC, useContext } from 'react';

import Container from 'components/Atoms/Container/Container';
import ViewMoreStyles from 'components/Molecules/ViewMore/ViewMore.module.css';
import { AppContext } from 'hooks/useContext';
import Image from 'components/Atoms/Image/Image'; // Import the Image component

const ViewMore: FC = () => {
  const { handleClickToScrollTo, isShowButton } = useContext(AppContext);
  
  return (
    <Container
      className={ViewMoreStyles.ViewMoreWrapper}
      onClick={handleClickToScrollTo}
      testId="viewMore"
    >
      <Image
        alt={appText.viewMore.cup.alt}
        className={ViewMoreStyles.ViewMoreImage}
        src="svg/cup.svg"
      />
      {isShowButton ? (
        <a className={ViewMoreStyles.ViewMoreLink} href="/">
          {appText.viewMore.cup.viewMoreLabel}
        </a>
      ) : (
        <a className={ViewMoreStyles.ViewMoreLink} href="/">
          {appText.viewMore.cup.viewLessLabel}
        </a>
      )}
    </Container>
  );
}

export default ViewMore;
