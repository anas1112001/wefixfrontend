import { fireEvent, screen } from '@testing-library/react'
import { appText } from 'data/appText'

import { AppProvider } from 'hooks/useContext'
import { render } from 'utils/testUtils'


import Cart from './Cart'

const { getByText, queryByTestId, queryByText } = screen

const cartElements = {
  cart: () => queryByTestId('cart'),
  emptyMessage: () => queryByText(appText.cart.emptyMessage),
  removeAll: () => queryByText(appText.cart.deleteAllAction),
  selection: () => queryByTestId('select-1'),
}

describe('Cart', () => {
  describe('When truthy isShowCart attribute passed', () => {
    it('renders the cart with necessary buttons', () => {
      render(<Cart isShowCart />)
      expect(cartElements.cart()).toBeInTheDocument()
      expect(cartElements.removeAll()).toBeInTheDocument()
    })

    it('renders a selection with card details', () => {
      render(
        <AppProvider
          appContext={{
            handleCardClick: jest.fn(),
            handleMutation: jest.fn(),
            handleShowModal: jest.fn(),
          }}
        >
          <Cart isShowCart />
        </AppProvider>
      )
      expect(cartElements.cart()).toBeInTheDocument()
      expect(cartElements.removeAll()).toBeInTheDocument()
      expect(cartElements.selection()).toBeInTheDocument()
    })

    it('removes all selected items when the remove all button is clicked', () => {
      const { rerender } = render(
        <AppProvider
          appContext={{
            handleCardClick: jest.fn(),
            handleMutation: jest.fn(),
            handleShowModal: jest.fn(),
          }}
        >
          <Cart isShowCart />
        </AppProvider>
      )

      expect(cartElements.cart()).toBeInTheDocument()
      fireEvent.click(getByText('Remove All'))
      rerender(
        <AppProvider
          appContext={{
            handleCardClick: jest.fn(),
            handleMutation: jest.fn(),
            handleShowModal: jest.fn(),
            selectedCards: [],
          }}
        >
          <Cart isShowCart />
        </AppProvider>
      )
      expect(cartElements.emptyMessage()).toBeInTheDocument()
    })
  })

  describe('When falsy isShowCart passed', () => {
    it('does not render the cart with isShowCart set to false', () => {
      render(<Cart isShowCart={false} />)
      expect(cartElements.cart()).not.toBeInTheDocument()
    })

    it('does not render the cart with no isShowCart prop provided', () => {
      render(<Cart />)
      expect(cartElements.cart()).not.toBeInTheDocument()
    })
  })
})
