import { Card } from '@/components/ui/Card';
import styles from './Locations.module.scss';

export function Locations() {
  return (
    <div className={styles.locationsPage}>
      <h1>Locations</h1>
      <Card>
        <p>Location management will be implemented here.</p>
      </Card>
    </div>
  );
}
