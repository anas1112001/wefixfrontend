import { CSSProperties, HTMLAttributes, ReactNode, forwardRef } from 'react';

interface IContainerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
  children: ReactNode | ReactNode[];
  className?: string;
  id?: string | number;
  onClick?: any;
  style?: CSSProperties;
  testId?: string;
}

const Container = forwardRef<HTMLDivElement, IContainerProps>(({
  children,
  className,
  id,
  onClick,
  style,
  testId,
  ...rest
}, ref) => (
  <div
    className={className}
    data-testid={testId}
    id={`${id}`}
    onClick={onClick}
    ref={ref}  // Apply ref to the div
    style={style}
    {...rest}
  >
    {children}
  </div>
));

export default Container;
