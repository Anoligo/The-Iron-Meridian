import { forwardRef } from 'react';
import styles from './Form.module.scss';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
  labelClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', wrapperClassName = '', labelClassName = '', ...props }, ref) => {
    const checkboxId = props.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className={`${styles.checkboxGroup} ${wrapperClassName}`}>
        <div className={styles.checkboxWrapper}>
          <input
            id={checkboxId}
            type="checkbox"
            ref={ref}
            className={`${styles.checkbox} ${error ? styles.inputError : ''} ${className}`}
            {...props}
          />
          {label && (
            <label htmlFor={checkboxId} className={`${styles.checkboxLabel} ${labelClassName}`}>
              {label}
            </label>
          )}
        </div>
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
