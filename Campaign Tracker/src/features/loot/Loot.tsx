import { Card } from '@/components/ui/Card';
import styles from './Loot.module.scss';

export function Loot() {
  return (
    <div className={styles.lootPage}>
      <h1>Loot & Inventory</h1>
      <Card>
        <p>Loot and inventory management will be implemented here.</p>
      </Card>
    </div>
  );
}
