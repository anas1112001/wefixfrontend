import { render, screen } from '@testing-library/react'

import Hero from './Hero'

const { queryByTestId } = screen

const heroElements = {
  heroCenter: () => queryByTestId('heroCenter'),
  mainCard: () => queryByTestId('mainCard'),
  viewMore: () => queryByTestId('viewMore'),
}

describe('Hero', () => {
  describe('When Hero is rendered', () => {
    it('renders the maincard with hero center and view more by default', () => {
      render(<Hero scrollToRef={null} />)
      expect(heroElements.mainCard()).toBeInTheDocument()
      expect(heroElements.heroCenter()).toBeInTheDocument()
      expect(heroElements.viewMore()).toBeInTheDocument()
    })
  })
})
