import { screen } from '@testing-library/react'
import { appText } from 'data/appText'

import { AppProvider } from 'hooks/useContext'
import { render } from 'utils/testUtils'


import AddProduct from './AddProduct'

const { getByTestId, queryByAltText } = screen

const addProductElements = {
  addProduct: () => getByTestId('addProduct'),
  productIcon: () => queryByAltText(appText.addProduct.alt),
}

describe('AddProduct', () => {
  describe('When the add More is rendered', () => {
    it('renders the add product button when the modal is hidden', () => {
      render(<AddProduct />)
      expect(addProductElements.productIcon()).toBeInTheDocument()
    })

    it('should not render the add product button when modal is shown', () => {
      render(
        <AppProvider
          appContext={{
            handleMutation: jest.fn(),
            handleShowModal: jest.fn(),
            isShowModal: true
          }}
        >
          <AddProduct />)
        </AppProvider>
      )

      expect(addProductElements.productIcon()).not.toBeInTheDocument()
    })
  })
})
