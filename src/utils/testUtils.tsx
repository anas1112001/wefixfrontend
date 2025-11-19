import { RenderOptions, render } from '@testing-library/react'
import React, { FC, ReactElement } from 'react'

import { AppProvider } from 'hooks/useContext'
import { useScrollTo } from 'hooks/useScrollTo'
import { useSelection } from 'hooks/useSelection'

const AllTheProviders: FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    handleCardClick,
    handleCartRemoveAll,
    handleDeleteCard,
    handleMutation,
    handleSetCardBorder,
    handleShowModal,
    handleUpdateCard,
  } = useSelection()
  const { handleClickToScrollTo } = useScrollTo()
  const context = {
    handleCardClick,
    handleCartRemoveAll,
    handleClickToScrollTo,
    handleDeleteCard,
    handleMutation,
    handleSetCardBorder,
    handleShowModal,
    handleUpdateCard,
  }

  return <AppProvider appContext={context}>{children}</AppProvider>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export { customRender as render }
