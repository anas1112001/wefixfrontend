import { useMemo } from 'react'

import Burger from 'components/Molecules/Burger/Burger'
import Navbar from 'components/Molecules/Navbar/Navbar'
import { useViewport } from 'hooks/useViewport'

function Navigation({ isInFooter }) {
  const viewport = useViewport()
  const Nav = useMemo(() => {
    if (viewport === 'extra-large') {
      return <Navbar isInFooter={isInFooter} />
    }

    if (viewport === 'extra-small') {
      return <Burger />
    }

    if (viewport === 'large') {
      return <Navbar isInFooter={isInFooter} />
    }
    
    return <Burger />
  }, [viewport]) as JSX.Element

  return Nav
}

export default Navigation
