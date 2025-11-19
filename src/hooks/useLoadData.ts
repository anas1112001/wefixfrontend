import { useEffect, useState } from 'react'
import fetch from 'node-fetch'

export const useLoadData = (
  handleDeleteCard?: (flag: string, id: string) => void,
  handleMutation?: (flag: string, id: string) => void,
  handleUpdateCard?: (uploadedData: DataItem) => void
) => {
  const [data, setData] = useState<DataItem[]>([])

  const queryGraphQLServer = async () => {
    const response = await fetch('https://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `{
          getAllProducts {
            products {
              id
              name
              description
              imageUrl
            }
          }
        }`,
      }),
    })
    const { data } = await response.json()

    setData(data.getAllProducts.products)
  }

  useEffect(() => {
    queryGraphQLServer()
  }, [handleDeleteCard, handleMutation, handleUpdateCard])

  return { data, queryGraphQLServer }
}
