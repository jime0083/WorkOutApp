/**
 * DateSeparator - 日付区切りコンポーネント
 */
import React from 'react';
import { formatDateSeparator } from '../../utils/date';
import styles from './DateSeparator.module.css';

interface DateSeparatorProps {
  date: Date;
}

export const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
  return (
    <div className={styles.container}>
      <span className={styles.label}>{formatDateSeparator(date)}</span>
    </div>
  );
};
