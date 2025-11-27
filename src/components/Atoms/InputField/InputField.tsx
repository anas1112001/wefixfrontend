import React from 'react';
import styles from './InputField.module.css';

const InputField = ({ className='', max=undefined, maxLength=undefined, min=undefined, minLength=undefined, name, onChange, pattern, placeholder, required=false, title, type, value, }) => (
  <input
    className={`${styles.inputField} ${className || ''}`}
    max={max}
    maxLength={maxLength}
    min={min}
    minLength={minLength}
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
