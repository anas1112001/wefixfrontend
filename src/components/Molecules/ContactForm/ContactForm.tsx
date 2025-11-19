import React from 'react'
import styles from './ContactForm.module.css'
import InputField from 'components/Atoms/InputField/InputField'
import Label from 'components/Atoms/Label/Label'
import Textarea from 'components/Atoms/TextArea/TextArea'
import Button from 'components/Atoms/Button/Button'
import useForm from 'hooks/useForm'
import Form from 'components/Atoms/Form/Form'
import Heading from 'components/Atoms/Heading/Heading'
import Mailto from 'components/Atoms/MailTo/MailTo'

const ContactForm = () => {
  const { formData, handleInputChange, handleSubmit } = useForm(
    {
      name: '',
      phone: '',
      email: '',
      interest: '',
    },
    (formData) => {
      const subject = `Contact Request from ${formData.name}`
      const body = `Name: ${formData.name}%0D%0A
Phone: ${formData.phone}%0D%0A
Email: ${formData.email}%0D%0A
Interest: ${formData.interest}`
      const mailtoLink = `mailto:info@yourdomain.com?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`

      window.location.href = mailtoLink // Open the email client
    }
  )

  return (
    <Form className={styles.contactForm} onSubmit={handleSubmit}>
      <Label>What's your name?*</Label>
      <InputField
        type="text"
        name="name"
        value={formData.name}
        placeholder="Enter your name"
        onChange={handleInputChange}
        required
        pattern={undefined}
        title={undefined}
      />

      <Label>What's your phone number?*</Label>
      <InputField
        type="tel"
        name="phone"
        value={formData.phone}
        placeholder="Enter your phone number"
        onChange={handleInputChange}
        pattern="^\+?[0-9\s]+$"
        title="Please enter a valid phone number."
        required
      />

      <Label>What's your email?</Label>
      <InputField
        type="email"
        name="email"
        value={formData.email}
        placeholder="Enter your email"
        onChange={handleInputChange}
        pattern={undefined}
        title={undefined}
      />

      <Label>Describe your interest</Label>
      <Textarea
        name="interest"
        value={formData.interest}
        placeholder="Describe your interest"
        onChange={handleInputChange}
      />

      <Button onClick={() => handleSubmit} className={styles.button}>
        <Mailto
          email="info@thesis.com"
          subject={`Contact Request from ${formData.name}`}
          body={`Name: ${formData.name}\nPhone: ${formData.phone}\nEmail: ${formData.email}\n\nInterest: ${formData.interest}`}
        >
          <Heading  className={styles.heading} >Submit</Heading>
        </Mailto>
      </Button>
    </Form>
  )
}

export default ContactForm
