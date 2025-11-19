import { appText } from 'data/appText';
import { FC, useContext } from 'react';
import Container from 'components/Atoms/Container/Container';
import AddProductStyles from 'components/Molecules/AddProduct/AddProduct.module.css';
import { AppContext } from 'hooks/useContext';
import Image from 'components/Atoms/Image/Image'; // Import the Image component
import Paragraph from 'components/Atoms/Paragraph/Paragraph'; // Import the Paragraph component

const AddProduct: FC = () => {
  const { handleShowModal, isShowModal } = useContext(AppContext);

  return (
    <>
      {!isShowModal && (
        <Container
          className={AddProductStyles.addProductWrapper}
          onClick={handleShowModal}
          testId="addProduct"
        >
          <Image
            alt={appText.addProduct.alt}
            className={AddProductStyles.addProductImage}
            src="svg/add.svg"
          />
          <Paragraph className={AddProductStyles.addProductTitle}>
            {appText.addProduct.label}
          </Paragraph>
        </Container>
      )}
    </>
  );
};

export default AddProduct;
