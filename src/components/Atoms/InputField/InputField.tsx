import React from 'react';
import styles from './InputField.module.css';

const InputField = ({ name, onChange, pattern, placeholder, required=false, title, type, value, }) => (
  <input
    className={styles.inputField}
    name={name}
    onChange={onChange}
    pattern={pattern}
    placeholder={placeholder}
    required={required}
    title={title}
    type={type}
    value={value}
  />
);

export default InputField;
