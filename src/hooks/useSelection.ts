import { set } from 'modules/localStroage'
import { RefObject, useEffect, useState } from 'react'


export const useSelection = () => {
  const [isCardHasBorder, setIsCardHasBorder] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isShowCart, setIsShowCart] = useState<boolean>(false);
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [operationType, setOperationType] = useState<string>('');
  const [selectedCards, setSelectedCards] = useState<DataItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');

  const handleLoading = () => {
    setTimeout(() => {
      setIsLoading(!isLoading);
    }, 100);
    setTimeout(() => {
      setIsLoading(false);
    }, 900);
  };

  const handleCartRemoveAll = () => {
    setSelectedCards([]);
  };

  const handleShowCart = () => {
    setIsShowCart(!isShowCart);
  };

  const handleSetCardBorder = () => {
    setIsCardHasBorder(!isCardHasBorder);
  };

  const handleCardClick = (ref: RefObject<unknown>, data: DataItem) => {
    setSelectedCards((prev) => [...prev, data]);
  };

  const handleShowModal = (timeout = 200) => {
    setOperationType('create');
    setTimeout(() => {
      setIsShowModal(!isShowModal);
    }, timeout);
  };

  const handleUpdateCard = (flag: string, id: string) => {
    if (flag) {
      setOperationType(flag);
    }

    setSelectedId(id);
    setIsShowModal(!isShowModal);
  };

  const handleDeleteCard = async (flag: string, id: string) => {
    if (operationType === 'delete') {
      await fetch('http://localhost:4000/graphql', {
        body: JSON.stringify({
          query: `
            mutation($deleteProductId: String) {
              deleteProduct(id: $deleteProductId)
            }`,
          variables: {
            deleteProductId: id,
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
    }


    if (flag) {
      setOperationType(flag);
    }

    setSelectedId(id);
    handleLoading();
  };

  const handleMutation = async (uploadedData: DataItem) => {
    if (operationType === 'create' || operationType === 'update') {
      await fetch('http://localhost:4000/graphql', {
        body: JSON.stringify({
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          query: `
            mutation($productId: String, $name: String, $description: String, $imageUrl: String) {
              ${operationType}Product(id: $productId, name: $name, description: $description, imageUrl: $imageUrl) {
                product {
                  name
                  description
                  imageUrl
                  id
                }
              }
            }`,


          variables: {
            description: uploadedData.subtitle,
            imageUrl: uploadedData.imageSrc,
            name: uploadedData.title,
            productId: uploadedData.buttonText,
          },
        }),
      });
    }

    handleLoading();
    handleShowModal(500);
  };

  useEffect(() => {
    set('items', selectedCards);
    handleLoading();
    
  }, [selectedCards]); 

  return {
    handleCardClick,
    handleCartRemoveAll,
    handleDeleteCard,
    handleLoading,
    handleMutation,
    handleSetCardBorder,
    handleShowCart,
    handleShowModal,
    handleUpdateCard,
    isCardHasBorder,
    isLoading,
    isShowCart,
    isShowModal,
    selectedCards,
    selectedId,

  };
};
