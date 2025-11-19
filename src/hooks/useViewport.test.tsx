import { act, render } from '@testing-library/react'
import React from 'react'

import { useViewport } from './useViewport'

const fireResize = (width: number) => {
  window.innerWidth = width
  window.dispatchEvent(new Event('resize'))
}

const AffectedComponent = () => {
  const viewport = useViewport()


  return <span>{viewport}</span>
}

describe('useViewport', () => {
  describe('When useViewport is rendered', () => {
    it('listen to window resize and set viewport size responsively', () => {
      const { container, rerender } = render(<AffectedComponent />)
      const span = container.firstChild as ChildNode

      act(() => {
        fireResize(320)
      })

      rerender(<AffectedComponent />)
      expect(span.textContent).toBe('extra-small')
      act(() => {
        fireResize(600)
      })
      rerender(<AffectedComponent />)
      expect(span.textContent).toBe('small')
      act(() => {
        fireResize(800)
      })
      rerender(<AffectedComponent />)
      expect(span.textContent).toBe('medium')
      act(() => {
        fireResize(1000)
      })
      rerender(<AffectedComponent />)
      expect(span.textContent).toBe('large')
      act(() => {
        fireResize(1440)
      })
      rerender(<AffectedComponent />)
      expect(span.textContent).toBe('extra-large')
    })
  })
})
