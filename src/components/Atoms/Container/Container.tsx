import { ReactNode, forwardRef } from 'react';

interface IContainerProps {
  children: ReactNode | ReactNode[];
  className?: string;
  id?: string | number;
  onClick?: any;
  testId?: string;
}

const Container = forwardRef<HTMLDivElement, IContainerProps>(({
  children,
  className,
  id,
  onClick,
  testId
}, ref) => (
  <div
    className={className}
    data-testid={testId}
    id={`${id}`}
    onClick={onClick}
    ref={ref}  // Apply ref to the div
  >
    {children}
  </div>
));

export default Container;
