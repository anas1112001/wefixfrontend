import React from 'react';
import styles from './Textarea.module.css';

interface TextAreaProps {
  name: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  value: string;
}

const Textarea = ({ name, onChange, placeholder, rows, value }: TextAreaProps) => (
  <textarea
    className={styles.textarea}
    name={name}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    value={value}
  />
);

export default Textarea;
