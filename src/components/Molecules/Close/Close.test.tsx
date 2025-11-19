import { fireEvent, render, screen } from '@testing-library/react'
import { appText } from 'data/appText'

import Close from './Close'

const { queryByAltText } = screen

const closeElements = {
  close: () => queryByAltText(appText.close.alt),
}

describe('Close', () => {
  describe('When the component is rendered', () => {
    it('should render the close icon', () => {
      const clickOnClose = jest.fn()

      render(<Close handleClose={clickOnClose} />)
      expect(closeElements.close()).toBeInTheDocument()
    })

    it('should be clickable', () => {
      const clickOnClose = jest.fn()

      render(<Close handleClose={clickOnClose} />)
      expect(closeElements.close()).toBeInTheDocument()

      const close = closeElements.close() as HTMLElement

      fireEvent.click(close)
      expect(clickOnClose).toHaveBeenCalled()
    })
  })
})
