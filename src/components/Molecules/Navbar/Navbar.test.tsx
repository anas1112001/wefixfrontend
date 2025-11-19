import { render, screen } from '@testing-library/react'
import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'

import * as useViewportModule from 'hooks/useViewport'

import Navbar from './Navbar'

const { getAllByTestId, queryByTestId } = screen

const navbarElements = {
  items: () => getAllByTestId('listitem'),
  list: () => queryByTestId('navbarList'),
}

let useViewportSpy: jest.SpyInstance

describe('Navbar', () => {
  describe('When the client is Web', () => {
    it('should render the navbar', () => {
      useViewportSpy = jest.spyOn(useViewportModule, 'useViewport')
      useViewportSpy.mockReturnValue('extra-large')
      render(
        <Router>
          <Navbar isInFooter={undefined} />
        </Router>
      )
      expect(navbarElements.items()).toHaveLength(6)
    })
  })

  describe('When the client is Mobile', () => {
    it('should not render the navbar', () => {
      useViewportSpy = jest.spyOn(useViewportModule, 'useViewport')
      useViewportSpy.mockReturnValue('extra-small')
      render(
        <Router>
          <Navbar isInFooter={undefined} />
        </Router>
      )
      expect(navbarElements.list()).not.toBeInTheDocument()
    })
  })
})
