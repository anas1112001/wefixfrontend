import React from 'react';
import styles from './Link.module.css';

type LinkProps = {
    children: React.ReactNode;
    className?: string;
    href: string;
};

const Link: React.FC<LinkProps> = ({ children, className = '', href, }) => (
    <a href={href} className={`${styles.link} ${className}`}>
        {children}
    </a>
);

export default Link;
