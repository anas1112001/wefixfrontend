import React from 'react'

import Container from 'components/Atoms/Container/Container'
import Header from 'components/Organisms/Header/Header'
import ContactUsStyles from 'pages/ContactUs/ContactUs.module.css'
import ContactUsHero from 'components/Organisms/ContactUsHero/ContactUsHero'
import Footer from 'components/Organisms/Footer/Footer'

const ContactUs = () => (
  <Container className="appContainer">
    <Header />
    <Container className={ContactUsStyles.contactUsWrapper}>
      <ContactUsHero />
    </Container>
    <Footer />
  </Container>
)

export default ContactUs
