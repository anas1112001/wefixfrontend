import { appText } from 'data/appText';
import { FC } from 'react';

import Container from 'components/Atoms/Container/Container';
import BucketStyles from 'components/Molecules/Bucket/Bucket.module.css';
import { useViewport } from 'hooks/useViewport';
import Image from 'components/Atoms/Image/Image'; // Import the Image component

interface IBucketProps {
  onCartClick?: () => void;
}

const Bucket: FC<IBucketProps> = ({ onCartClick }) => (
  <Container className={BucketStyles.bucketWrapper}>
    <Container className={BucketStyles.wrappedLogo}>
      {useViewport() !== 'extra-large' && (
        <Image
          alt={appText.bucket.mobileLogoIcon.alt}
          className={BucketStyles.mobileLogoIcon}
          src="svg/logo.svg"
        />
      )}
    </Container>
    <Container className={BucketStyles.wrappedProfile}>
      <Image
        alt={appText.bucket.shoppingIcon.alt}
        className={BucketStyles.shoppingIcon}
        onClick={onCartClick}
        src="images/shoppingIcon.png"
      />
      <Image
        alt={appText.bucket.profileIcon.alt}
        className={BucketStyles.profileIcon}
        src="images/profileImage.png"
      />
    </Container>
  </Container>
);

export default Bucket;
