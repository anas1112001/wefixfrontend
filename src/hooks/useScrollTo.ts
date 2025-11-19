import { useState } from 'react'

export const useScrollTo = () => {
  const [isShowItem, setIsShowItem] = useState(false)
  const [isShowButton, setIsShowButton] = useState(true)

  const scrollConfig: boolean | ScrollIntoViewOptions | undefined = {
    behavior: 'smooth',
    block: 'end',
    inline: 'nearest',
  }

  const handleClickToScrollTo = (e: Event, item = 'contentCards') => {
    e.preventDefault()

    setIsShowButton(!isShowButton)
    setIsShowItem(!isShowItem)

    const component = document.getElementById(item)


    if(component){
      component.scrollIntoView(scrollConfig)
    }
  }

  return {
    handleClickToScrollTo,
    isShowButton,
    isShowItem,
  }
}
