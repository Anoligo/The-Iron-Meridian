import { ReactNode } from 'react';
import styles from './Form.module.scss';

interface FormGroupProps {
  children: ReactNode;
  className?: string;
  label?: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
}

export function FormGroup({ 
  children, 
  className = '', 
  label, 
  htmlFor, 
  error,
  required = false 
}: FormGroupProps) {
  return (
    <div className={`${styles.formGroup} ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.formControl}>
        {children}
      </div>
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
}

export default FormGroup;
