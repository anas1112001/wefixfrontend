import { appText } from 'data/appText';
import { FC, useContext } from 'react';

import Container from 'components/Atoms/Container/Container';
import CartStyles from 'components/Molecules/Cart/Cart.module.css';
import Selection from 'components/Molecules/Selection/Selection';
import { AppContext } from 'hooks/useContext';
import Heading from 'components/Atoms/Headings/Headings'; // Make sure the import path is correct
import Paragraph from 'components/Atoms/Paragraph/Paragraph'; // Import the Paragraph component

interface ICartProps {
  isShowCart?: boolean;
}

const Cart: FC<ICartProps> = ({ isShowCart = false }) => {
  const { handleCartRemoveAll, selectedCards } = useContext(AppContext);

  return (
    <>
      {isShowCart && (
        <Container className={CartStyles.cartWrapper} testId="cart">
          <Container className={CartStyles.cartHeader}>
            <Heading level="3" className={CartStyles.cartHeading}>
              Shopping Cart
            </Heading>
            {selectedCards?.length !== 0 && (
              <Heading
                level="5"
                className={CartStyles.removeAction}
                onClick={handleCartRemoveAll} // Properly handling the onClick event
              >
                {appText.cart.deleteAllAction}
              </Heading>
            )}
          </Container>
          <Container className={CartStyles.cartContent}>
            {selectedCards?.length === 0 ? (
              <Paragraph className={CartStyles.nullContent} data-testid="message">
                {appText.cart.emptyMessage}
              </Paragraph>
            ) : (
              selectedCards?.map((el: DataItem) => (
                  <div >
                    <Selection data={el} testId={`select-${el.title}`} />
                  </div>
                ))
            )}
          </Container>
        </Container>
      )}
    </>
  );
}

export default Cart;
