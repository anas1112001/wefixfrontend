import React from 'react'

import Container from 'components/Atoms/Container/Container'
import styles from 'components/Organisms/AboutUsHero/AboutUsHero.module.css'
import Paragraph from 'components/Atoms/Paragraph/Paragraph'
import Title from 'components/Atoms/Title/Title'
import Image from 'components/Atoms/Image/Image'

const AboutUsHero = () => (
  <Container className={styles.aboutUsHeroWrapper}>
    <Container className={styles.left} ><Image className={styles.image} alt={''} src="images/team.png" /> </Container>

    <Container className={styles.right1} ><Title className={styles.title} level={'1'}>WHO WE ARE</Title></Container>

    <Container className={styles.right2} ><Paragraph className={styles.paragraph}>
      Gain comprehensive analytics on AI and robotics trends to guide your strategic decisions.
    </Paragraph></Container>

    <Container className={styles.right3} ><Image className={styles.columedImage} alt={''} src="images/rocket.png" />
      <Container className={styles.textWrapper} >
        <Title className={styles.columedTitle} level={'1'}>Accelerate with Us</Title>
        <Paragraph className={styles.columedParagraph}>
          Elevate your projects with our advanced
          technology and agile solutions.
        </Paragraph>
      </Container>
    </Container>

    <Container className={styles.right4} >  
      <Image className={styles.columedImage} alt={''} src="images/lamp.png" />
      
      <Container className={styles.textWrapper} >
        <Title className={styles.columedTitle} level={'1'}>Spark Innovation</Title>
        <Paragraph className={styles.columedParagraph}>
          Illuminate your business with creative
          solutions and strategic insights.
        </Paragraph>
      </Container>
    </Container>
  </Container>
)

export default AboutUsHero
