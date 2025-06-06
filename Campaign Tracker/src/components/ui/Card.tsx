import { ReactNode } from 'react';
import styles from './Card.module.scss';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div className={clsx(styles.card, className)} onClick={onClick}>
      {children}
    </div>
  );
}
