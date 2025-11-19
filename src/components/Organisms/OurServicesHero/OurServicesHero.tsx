import React from 'react'
import styles from './OurServicesHero.module.css'
import Section from 'components/Molecules/Section/Section'
import Container from 'components/Atoms/Container/Container'

const OurServicesHero = () => (
  <Container className={styles.ourServicesHeroWrapper}>
    <Section
      imageSrc="/images/our-services-01.png"
      title="Machine Learning"
      description="Our machine learning experts are dedicated to delivering a range of services to help you harness the power of AI. We tackle the challenges of developing and integrating machine learning models into your core systems, ensuring you establish a reliable and innovative AI infrastructure."
    />
    <Section
      imageSrc="/images/our-services-02.png"
      title="3D Printing"
      description="TheSIS provides comprehensive 3D printing services that enhance your business operations and product development. We specialize in delivering high-efficiency solutions that transform your concepts into reality, raising the level of innovation and efficiency in your production processes and products."
    />
    <Section
      imageSrc="/images/our-services-03.png"
      title="Application Development"
      description="TheSIS offers specialized application development services to enhance your business operations. Our expert developers create robust and efficient applications, ensuring seamless integration and innovation to elevate your digital presence."
    />
  </Container>
)

export default OurServicesHero
