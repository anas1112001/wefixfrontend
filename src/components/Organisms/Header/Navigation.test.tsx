import { render, screen } from '@testing-library/react'

import * as useViewportModule from 'hooks/useViewport'

import Navigation from './Navigation'

const { queryByTestId } = screen

const useViewportSpy = jest.spyOn(useViewportModule, 'useViewport')

beforeEach(() => {
  useViewportSpy.mockClear();  // Clear any previous calls to the spy
  render(<Navigation isInFooter={undefined} />)
})

const navigationElements = {
  bars: () => queryByTestId('bars'),
}

describe('Navigation', () => {
  describe('When page loads', () => {
    it('should render Burger in mobile view', () => {
      useViewportSpy.mockReturnValueOnce('extra-small')
      expect(navigationElements.bars()).toBeInTheDocument()
    })

    it('should not render Burger in web view and bars not active', () => {
      useViewportSpy.mockReturnValueOnce('extra-large')
      render(<Navigation isInFooter={undefined} />)
      expect(navigationElements.bars()).not.toBeInTheDocument()  // This is the assertion to check the condition
    })
  })
})
