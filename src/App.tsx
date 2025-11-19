import { FC, useRef } from 'react'

import Container from 'components/Atoms/Container/Container'

import Footer from 'components/Organisms/Footer/Footer'
import Header from 'components/Organisms/Header/Header'
import Hero from 'components/Organisms/Hero/Hero'
import { AppProvider } from 'hooks/useContext'
import { useLoadData } from 'hooks/useLoadData'
import { useScrollTo } from 'hooks/useScrollTo'
import { useSelection } from 'hooks/useSelection'

import 'styles/App.css'

const HomeApp: FC = () => {
  const { data } = useLoadData()
  const {
    handleCardClick,
    handleCartRemoveAll,
    handleMutation,
    handleShowCart,
    handleShowModal,
    isShowCart,
    isShowModal,
    selectedCards,
  } = useSelection()
  const { handleClickToScrollTo, isShowButton, isShowItem } = useScrollTo()
  const context = {
    data,
    handleCardClick,
    handleCartRemoveAll,
    handleClickToScrollTo,
    handleMutation,
    handleShowCart,
    handleShowModal,
    isShowButton,
    isShowCart,
    isShowItem,
    isShowModal,
    selectedCards,
  }

  const techAreaRef = useRef(null)

  return (
    <AppProvider appContext={context}>
      <Container className="appContainer">
        <Header />
        <Hero scrollToRef={techAreaRef} />
        <Footer />
      </Container>
    </AppProvider>
  )
}

const App: FC = () => <HomeApp />

export default App
