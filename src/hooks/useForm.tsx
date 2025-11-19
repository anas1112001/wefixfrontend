import { useState } from 'react'

const useForm = (initialValues, onSubmit) => {
  const [formData, setFormData] = useState(initialValues)


  const handleInputChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return {
    formData,
    handleInputChange,
    handleSubmit,
  }
}

export default useForm
