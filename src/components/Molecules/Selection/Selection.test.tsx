import { render, screen } from '@testing-library/react'
import data from 'data/items.json'

import Selection from './Selection'

const { queryByAltText, queryByTestId, queryByText } = screen


const selectionElements = {
  image: () => queryByAltText(data[0].name),
  selection: () => queryByTestId('select-0'),
  text: () => queryByText(data[0].name),
}

describe('Selection', () => {
  describe('When the cart is not empty', () => {
    it('should render a selection if data provided', () => {
      render(<Selection  testId="select-0" />)

      expect(selectionElements.image()).toBeInTheDocument()
      expect(selectionElements.selection()).toBeInTheDocument()
      expect(selectionElements.text()).toBeInTheDocument()
    })

    it('should not render a selection if data provided is not valid', () => {
      render(<Selection testId="select-0" />)

      expect(selectionElements.image()).not.toBeInTheDocument()
      expect(selectionElements.text()).not.toBeInTheDocument()
    })

    it('should not render a selection if data not provided', () => {
      render(<Selection />)

      expect(selectionElements.image()).not.toBeInTheDocument()
      expect(selectionElements.selection()).not.toBeInTheDocument()
      expect(selectionElements.text()).not.toBeInTheDocument()
    })
  })
})
