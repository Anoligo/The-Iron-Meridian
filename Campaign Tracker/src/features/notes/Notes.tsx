import { Card } from '@/components/ui/Card';
import styles from './Notes.module.scss';

export function Notes() {
  return (
    <div className={styles.notesPage}>
      <h1>Notes & Backstories</h1>
      <Card>
        <p>Notes and backstories will be managed here.</p>
      </Card>
    </div>
  );
}
