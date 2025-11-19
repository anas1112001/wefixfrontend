import React from 'react'
import styles from './Hero.module.css'
import Paragraph from 'components/Atoms/Paragraph/Paragraph'
import Button from 'components/Atoms/Button/Button'
import Container from 'components/Atoms/Container/Container'
import { useInView } from 'react-intersection-observer'
import Image from 'components/Atoms/Image/Image'
import { useNavigate } from 'react-router-dom'

const Hero = ({ scrollToRef }) => {
  const navigate = useNavigate()

  const { inView: leftInView1, ref: leftRef1 } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    delay: 300,
  })

  const { inView: leftInView2, ref: leftRef2 } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    delay: 300,
  })

  const { inView: rightInView, ref: rightRef } = useInView({
    threshold: 0.1,
    triggerOnce: false,
    delay: 300,
  })

  const handleScrollToTech = () => {
    scrollToRef.current.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Container className={styles.gridWrapper}>
        <Container
          ref={leftRef1}
          className={`${styles.leftBlock1} ${
            leftInView1 ? styles.slideInLeft : ''
          }`}
        >
          <Paragraph className={styles.pargraph}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </Paragraph>
        </Container>

        <Container
          ref={leftRef2}
          className={`${styles.leftBlock2} ${
            leftInView2 ? styles.slideInLeft : ''
          }`}
        >
          <Paragraph className={styles.heroButtonTitle}>
            Request your service now!
          </Paragraph>
          <Button onClick={handleScrollToTech} className={styles.heroButton}>
            Request
          </Button>
        </Container>

        <Container
          ref={rightRef}
          className={`${styles.rightBlock} ${
            rightInView ? styles.slideInRight : ''
          }`}
        >
          <Image
            src="images/hero-image.png"
            alt="Descriptive Alt Text"
            className={styles.heroImage}
          />
        </Container>
      </Container>
    </>
  )
}

export default Hero
