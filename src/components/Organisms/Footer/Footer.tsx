import React from 'react';
import styles from './Footer.module.css';
import Image from 'components/Atoms/Image/Image';
import Container from 'components/Atoms/Container/Container';
import Link from 'components/Atoms/Link/Link';
import Title from 'components/Atoms/Title/Title';
import Paragraph from 'components/Atoms/Paragraph/Paragraph';
import { appText } from 'data/appText';
import NavItem from 'components/Atoms/NavItem/NavItem';
import NavList from 'components/Atoms/NavList/NavList';

const Footer = () => (
    <Container className={styles.footerWrapper}>
        <Container className={styles.logoWrapper}>
            <Image src="/svg/logo.svg" alt="The SIS Tech Logo" />
        </Container>
        <Container className={styles.linksWrapper}>
            <Title className={styles.label} level={'1'}>Quick Links</Title>
            <NavList isInFooter={true}>
                {appText.navItems.map((item, idx) => (
                    <NavItem key={item} link={`/${appText.links[idx]}`} label={item} />
                ))}
            </NavList>
        </Container>
        <Container className={styles.paymentWrapper}>
            <Title className={styles.label} level={'1'}>We accept following payment systems</Title>
            <Image src="images/visa.png" alt="Visa Payment" />
        </Container>
        <Container className={styles.copyRightWrapper}>
            <Paragraph className={styles.copyRight}>©2025 WeFIx. All rights reserved</Paragraph>
        </Container>
        <Container className={styles.socialMediaWrapper}>
            <Link href="https://www.facebook.com"> <Image src="images/facebook.png" alt="Facebook" className={styles.socialIcon} /></Link>
            <Link href="https://www.instagram.com"><Image src="images/instagram.png" alt="Instagram" className={styles.socialIcon} /></Link>
            <Link href="https://www.linkedin.com"> <Image src="images/linkedin.png" alt="LinkedIn" className={styles.socialIcon} /></Link>
        </Container>
    </Container>
);

export default Footer;
