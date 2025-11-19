import { validateImage } from 'image-validator'
import { useState } from 'react'

export const useValidation = (data?: DataItem) => {
  const [imagUrl, setImageUrl] = useState<string | undefined>(data?.imageSrc)

  const handleValidation = (data: DataItem) => {
    validateImage(data.imageSrc).then((result) =>
      result ? setImageUrl(data.imageSrc) : setImageUrl('images/404.png')
    )
  }

    if(data){

      handleValidation(data)
    }

  return { handleValidation, imagUrl }
}
