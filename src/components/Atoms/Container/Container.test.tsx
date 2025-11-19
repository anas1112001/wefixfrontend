import { render, screen } from '@testing-library/react'

import Container from './Container'

const { getByTestId, getByText } = screen

const mockText = 'AA'

const containerElements = {
  children: () => getByText(mockText),
  container: () => getByTestId('contaienr'),
}

describe('Container', () => {
  describe('When Container is rendered with children', () => {
    it('should be in the document', () => {
      render(
        <Container className="ItemContainer" testId="contaienr">
          <span>{mockText}</span>
        </Container>
      )

      expect(containerElements.container()).toBeInTheDocument()
      expect(containerElements.children()).toBeInTheDocument()
    })
  })
})
