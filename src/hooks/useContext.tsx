import { FC, MouseEventHandler, ReactNode , RefObject, createContext } from 'react'

export type AppContextType = {
  data?: DataItem[]
  handleCardClick?: (ref: RefObject<unknown>, data: DataItem) => void
  handleCartRemoveAll?: MouseEventHandler<HTMLElement>
  handleClickToScrollTo?: (e: Event, item: string) => void
  handleDeleteCard?: (flag: string, id: string) => void
  handleLoading?: () => void
  handleMutation: (uploadedData: DataItem) => void
  handleShowCart?: () => void
  handleShowModal: (timeout?: number) => void
  handleUpdateCard?: (flag: string, id: string) => void
  isLoading?: boolean
  isShowButton?: boolean
  isShowCart?: boolean
  isShowItem?: boolean
  isShowModal?: boolean
  operationType?: string
  selectedCards?: DataItem[]
  selectedId?: string
}

interface IAppProviderProps {
  appContext: AppContextType,
  children: ReactNode
}

export const AppContext = createContext<AppContextType>({
  data: [],
  handleCardClick: () => undefined,
  handleCartRemoveAll: () => undefined,
  handleClickToScrollTo: () => undefined,
  handleDeleteCard: () => undefined,
  handleLoading: () => undefined,
  handleMutation: () => undefined,
  handleShowCart: () => undefined,
  handleShowModal: () => undefined,
  handleUpdateCard: () => undefined,
  isLoading: false,
  isShowButton: true,
  isShowCart: false,
  isShowItem: false,
  isShowModal: false,
  operationType: '',
  selectedCards: [],
  selectedId: '',
})

export const AppProvider: FC<IAppProviderProps> = ({
  appContext,
  children,
}: IAppProviderProps) => (
    <AppContext.Provider value={appContext}>{children}</AppContext.Provider>
  )
