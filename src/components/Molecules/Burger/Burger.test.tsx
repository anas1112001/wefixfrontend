import { fireEvent, render, screen } from '@testing-library/react'
import { appText } from 'data/appText'
import { BrowserRouter as Router } from 'react-router-dom'

import Burger from './Burger'

const { getByTestId, getByText } = screen

const burgerElements = {
  bars: () => getByTestId('bars'),
}

describe('Burger', () => {
  describe('When the client is Mobile', () => {
    beforeEach(() => {
      render(
        <Router>
          <Burger />
        </Router>
      )
    })

    it('renders the burger bars', () => {
      expect(burgerElements.bars()).toBeInTheDocument()
    })

    it.each(appText.navItems)('nav item %s', (el) => {
      fireEvent.click(burgerElements.bars())
      expect(getByText(el)).toBeInTheDocument()
    })
  })
})
