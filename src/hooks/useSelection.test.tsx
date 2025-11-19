import { act, renderHook } from '@testing-library/react'
import data from 'data/items.json'
import { createRef } from 'react'

import { useSelection } from 'hooks/useSelection'

describe('useSelection', () => {
  describe('When the useSelection Hook is rendered', () => {
    describe('In Home Page', () => {
      it('should select a card  and add it to selected cards  on click', () => {
        const { result } = renderHook(() => useSelection())
        const clickOnCard = jest.fn(result.current.handleCardClick)

        const ref = createRef()

        act(() => {
        })
        expect(clickOnCard).toHaveBeenCalledWith(ref, data[0])
        expect(result.current.selectedCards).toStrictEqual([data[0]])
      })

      it('should remove all items in the cart when remove all is clicked', () => {
        const { result } = renderHook(() => useSelection())
        const clickOnRemoveAll = jest.fn(result.current.handleCartRemoveAll)

        act(() => {
          clickOnRemoveAll()
        })
        expect(clickOnRemoveAll).toHaveBeenCalled()
      })

      it('should set the border when card is clicked', () => {
        const { result } = renderHook(() => useSelection())
        const clickOnCard = jest.fn(result.current.handleSetCardBorder)

        act(() => {
          clickOnCard()
        })
        expect(clickOnCard).toHaveBeenCalled()
      })
    })

    describe('In Products Page', () => {
      it('should  add product when add product is clicked', () => {
        const { result } = renderHook(() => useSelection())
        const clickOnAddProduct = jest.fn(result.current.handleShowModal)

        act(() => {
          clickOnAddProduct()
        })
        expect(clickOnAddProduct).toHaveBeenCalled()
      })

      it('should update product when update is clicked', () => {
        const { result } = renderHook(() => useSelection())
        const clickOnUpdate = jest.fn(result.current.handleUpdateCard)

        act(() => {
          clickOnUpdate('update', '10')
        })
        expect(clickOnUpdate).toHaveBeenCalled()
      })

      it('should delete product when delete is clicked', () => {
        const { result } = renderHook(() => useSelection())
        const clickOnDelete = jest.fn(result.current.handleDeleteCard)

        act(() => {
          clickOnDelete('delete', '0')
        })
        expect(clickOnDelete).toHaveBeenCalledWith('delete', '0')
      })
    })
  })
})
