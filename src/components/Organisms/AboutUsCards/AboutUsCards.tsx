import Container from 'components/Atoms/Container/Container'
import Title from 'components/Atoms/Title/Title'
import Card from 'components/Molecules/Card/Card'
import { forwardRef } from 'react'
import { useInView } from 'react-intersection-observer'
import styles from './AboutUsCards.module.css'

const AboutUsCards = forwardRef((props, ref) => {
  const { inView, ref: inViewRef } = useInView({
    threshold: 0.1, // Lower threshold might be better for mobile
    triggerOnce: true, // Change to true to trigger animation once
  })

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
      <Title className={styles.title} level={'1'}>
        Our Team
      </Title>
      <Container className={styles.cardsWrapper}>
        <Card
          imageSrc="images/about-us-ahmad.jpg"
          title="CEO & Founder"
          subtitle="Ahmad leads our team with a focus on innovation in Technology and Engineering"
          buttonText="LinkedIn Profile"
          onButtonClick={() =>
            open(
              'https://www.linkedin.com',
              '_blank'
            )
          }
        />
        <Card
          imageSrc="images/about-us-jehad.jpg"
          title="Technical Development Leader"
          subtitle="Jehad drives our software development, ensuring we build solutions based on client needs."
          buttonText="LinkedIn Profile"
          onButtonClick={() =>
            open('https://www.linkedin.com ', '_blank')
          }
        />
        <Card
          imageSrc="images/about-us-mohammad.jpg"
          title="Robotics Engineer & Digital Fabricator"
          subtitle="Mohammad specializes in robotics and digital fabrication, advancing our 3D printing and technical capabilities."
          buttonText="LinkedIn Profile"
          onButtonClick={() =>
            open('https://www.linkedin.com', '_blank')
          }
        />
      </Container>
    </Container>
  )
})

export default AboutUsCards
