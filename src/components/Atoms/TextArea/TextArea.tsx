import React from 'react';
import styles from './Textarea.module.css';

const Textarea = ({ name, onChange, placeholder, value, }) => (
  <textarea
    className={styles.textarea}
    name={name}
    value={value}
    placeholder={placeholder}
    onChange={onChange}
  />
);

export default Textarea;
