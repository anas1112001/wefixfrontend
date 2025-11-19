import { act, renderHook } from '@testing-library/react'
import { useLoadData } from './useLoadData'

describe('UseLoadData', () => {
  describe('When the useLoadData Hook is rendered', () => {
    it('should load data', async () => {
      const { result } = renderHook(() => useLoadData())
      const query = jest.fn(result.current.queryGraphQLServer)

      act(() => {
        query()
      })

      expect(result.current.data).toBeInstanceOf(Array)
    })
  })
})
