import { act, renderHook } from '@testing-library/react'

import { useValidation } from './useValidation'

const samples = {
  valid: {
    description:'Coffee is a brewed drink prepared from roasted coffee beans, the seeds of berries from certain Coffea species.',
    id: '0',
    imageUrl: 'https://picsum.photos/250',
    name: 'Mochaticho Late',
  },
}

describe('useImageValidation', () => {
  describe('When the hook is rendered', () => {
    it('should validate the image url', async () => {
      const { result } = renderHook(() => useValidation())
      const validate = jest.fn(result.current.handleValidation)

      act(() => {
        
      })
      expect(validate).toHaveBeenCalledWith(samples.valid)
    })

    it('should be able to carry undefined data', async () => {
      const { result } = renderHook(() => useValidation(undefined))
      const validate = jest.fn(result.current.handleValidation)

      act(() => {
        
      })
      expect(validate).toHaveBeenCalledWith(samples.valid)
    })
  })
})
