import { Card } from '@/components/ui/Card';
import styles from './Characters.module.scss';

export function Characters() {
  return (
    <div className={styles.charactersPage}>
      <h1>Characters</h1>
      <Card>
        <p>Character management will be implemented here.</p>
      </Card>
    </div>
  );
}
