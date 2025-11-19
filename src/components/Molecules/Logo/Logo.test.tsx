import { render, screen } from '@testing-library/react'
import { appText } from 'data/appText'

import Logo from './Logo'

const { getByAltText } = screen

const logoElments = {
  logo: () => getByAltText(appText.logo.alt),
}

describe('Logo', () => {
  describe('When the page loads', () => {
    it('should render the icon', () => {
      render(<Logo />)
      expect(logoElments.logo()).toBeInTheDocument()
    })
  })
})
