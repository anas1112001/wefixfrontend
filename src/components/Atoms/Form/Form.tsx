import React, { FC, FormEventHandler } from 'react';

interface FormProps {
  children: React.ReactNode;
  className?: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

const Form: FC<FormProps> = ({ children, className, onSubmit }) => (
  <form className={className} onSubmit={onSubmit}>
    {children}
  </form>
);

export default Form;
