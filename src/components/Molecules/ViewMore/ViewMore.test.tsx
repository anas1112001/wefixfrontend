import { render, screen } from '@testing-library/react'
import { appText } from 'data/appText'

import { AppProvider } from 'hooks/useContext'


import ViewMore from './ViewMore'

const { queryByAltText, queryByTestId, queryByText } = screen

const viewMoreElements = {
  content: () => queryByTestId('itemstoView'),
  cup: () => queryByAltText(appText.viewMore.cup.alt),
  viewLessLink: () => queryByText(appText.viewMore.cup.viewLessLabel),
  viewMoreLink: () => queryByText(appText.viewMore.cup.viewMoreLabel),
}

describe('ViewMore', () => {
  describe('When the page loads', () => {
    it('should be visible based on truthy isShowButton', () => {
      render(
        <AppProvider
          appContext={{
            handleClickToScrollTo: jest.fn(),
            handleMutation: jest.fn(),
            handleShowModal: jest.fn(),
            isShowButton: true,
          }}
        >
          <ViewMore />
        </AppProvider>
      )

      expect(viewMoreElements.cup()).toBeInTheDocument()
      expect(viewMoreElements.viewMoreLink()).toBeInTheDocument()
    })

    it('should be hidden based on falsy isShowButton', () => {
      render(
        <AppProvider
          appContext={{
            handleClickToScrollTo: jest.fn(),
            handleMutation: jest.fn(),
            handleShowModal: jest.fn(),
            isShowButton: false,
          }}
        >
          <ViewMore />
        </AppProvider>
      )

      expect(viewMoreElements.cup()).toBeInTheDocument()
      expect(viewMoreElements.viewLessLink()).toBeInTheDocument()
    })
  })
})
