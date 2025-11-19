import { render, screen } from '@testing-library/react'
import { appText } from 'data/appText'

import * as useViewportModule from 'hooks/useViewport'


import Bucket from './Bucket'

const { queryByAltText } = screen

const bucketElements = {
  mobileLogoIcon: () => queryByAltText(appText.bucket.mobileLogoIcon.alt),
  profileIcon: () => queryByAltText(appText.bucket.profileIcon.alt),
  shoppingIcon: () => queryByAltText(appText.bucket.shoppingIcon.alt),
}

let useViewportSpy: jest.SpyInstance

describe('Bucket', () => {
  beforeEach(() => {
    useViewportSpy = jest.spyOn(useViewportModule, 'useViewport')
  })
  
  describe('When the client is mobile', () => {
    it('renders the bucket component with mobile icon', () => {
      const clickOnCart = jest.fn()

      useViewportSpy.mockReturnValueOnce('extra-small')
      render(<Bucket onCartClick={clickOnCart}/>)
      expect(bucketElements.mobileLogoIcon()).toBeInTheDocument()
      expect(bucketElements.profileIcon()).toBeInTheDocument()
      expect(bucketElements.shoppingIcon()).toBeInTheDocument()
    })
  })

  describe('When the client is Web', () => {
    it('renders the bucket component without mobile icon', () => {
      const clickOnCart = jest.fn()

      useViewportSpy.mockReturnValueOnce('extra-large')
      render(<Bucket onCartClick={clickOnCart}/>)
      expect(bucketElements.mobileLogoIcon()).not.toBeInTheDocument()
      expect(bucketElements.profileIcon()).toBeInTheDocument()
      expect(bucketElements.shoppingIcon()).toBeInTheDocument()
    })
  })
})
