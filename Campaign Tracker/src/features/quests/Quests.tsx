import { Card } from '@/components/ui/Card';
import styles from './Quests.module.scss';

export function Quests() {
  return (
    <div className={styles.questsPage}>
      <h1>Quests</h1>
      <Card>
        <p>Quests management will be implemented here.</p>
      </Card>
    </div>
  );
}
