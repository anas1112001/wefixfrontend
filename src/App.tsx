import { FC, useRef } from 'react'

import Container from 'components/Atoms/Container/Container'
import Header from 'components/Organisms/Header/Header'

import 'styles/App.css'
import { useLoadData } from 'hooks/useLoadData'
import { useSelection } from 'hooks/useSelection'
import { useScrollTo } from 'hooks/useScrollTo'
import { AppProvider } from 'hooks/useContext'
import Footer from 'components/Organisms/Footer/Footer'

const App: FC = () => {
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

  const techAreaRef = useRef(null); 


  return (
    <AppProvider appContext={context}>
      <Container className="appContainer">
        <Header />
        <Footer />
      </Container>
    </AppProvider>
  )
}

export default App
