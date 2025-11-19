import React, { forwardRef } from 'react'
import styles from './OurWorkshopsHero.module.css'
import Container from 'components/Atoms/Container/Container'
import Card from 'components/Molecules/Card/Card'
import { useInView } from 'react-intersection-observer'
import Paragraph from 'components/Atoms/Paragraph/Paragraph'

const OurWorkshopsHero = forwardRef((props, ref) => {
  const { inView, ref: inViewRef } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  const handleButtonClick = () => {
    window.location.href =
      'https://www.youtube.com/watch?v=KISXj_dFrOk&ab_channel=RASBAU'
  }

  const setRefs = (node) => {
    inViewRef(node)

    if (typeof ref === 'function') {
      ref(node)
    } else if (ref) {
      ref.current = node
    }
  }

  return (
    <Container
      className={`${styles.areaWrapper} ${inView ? styles.fadeIn : ''}`}
      ref={setRefs}
    >
      <Paragraph className={styles.title}>Our Workshops</Paragraph>
      <Paragraph className={styles.description}>
        We're proud to facilitate engaging workshops in collaboration with
        student branches at universities. Our sessions are designed to provide
        students with practical skills and knowledge in cutting-edge
        technologies and industry practices. Through these workshops, we aim to
        bridge the gap between academic learning and real-world application,
        ensuring that students are well-prepared for their future careers.
      </Paragraph>
      <Container className={styles.cardsWrapper}>
        <Card
          imageSrc="/images/our-workshops/applied-ml.jpeg"
          title="Applied Machine Learning"
          buttonText="See More"
          onButtonClick={handleButtonClick}
          subtitle="a comprehensive presentation on the fundamentals of Machine Learning, exploring key concepts, applications, and emerging trends. This session provided attendees with valuable insights into leveraging machine learning technologies for enhancing business strategies and operational efficiencies."
        />
      </Container>
    </Container>
  )
})

export default OurWorkshopsHero
