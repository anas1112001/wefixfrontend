import { ChangeEventHandler, FC } from 'react';

import styles from './InputField.module.css';

type InputFieldProps = {
  name: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  pattern?: string;
  placeholder?: string;
  required?: boolean;
  title?: string;
  type: string;
  value?: string | number | readonly string[];
};

const InputField: FC<InputFieldProps> = ({
  name,
  onChange,
  pattern,
  placeholder,
  required = false,
  title,
  type,
  value,
}) => (
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
