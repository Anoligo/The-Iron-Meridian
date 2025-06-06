import { Card } from '@/components/ui/Card';
import { Swords, Users, MapPin, Gem } from 'lucide-react';
import styles from './Dashboard.module.scss';

export function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <h1>Campaign Dashboard</h1>
      
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}>
            <Swords size={32} />
          </div>
          <div className={styles.statContent}>
            <h3>Active Quests</h3>
            <p className={styles.statValue}>5</p>
            <p className={styles.statDescription}>3 main, 2 side quests</p>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={32} />
          </div>
          <div className={styles.statContent}>
            <h3>Characters</h3>
            <p className={styles.statValue}>4</p>
            <p className={styles.statDescription}>3 players, 1 NPC</p>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statIcon}>
            <MapPin size={32} />
          </div>
          <div className={styles.statContent}>
            <h3>Locations</h3>
            <p className={styles.statValue}>12</p>
            <p className={styles.statDescription}>8 discovered</p>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statIcon}>
            <Gem size={32} />
          </div>
          <div className={styles.statContent}>
            <h3>Loot</h3>
            <p className={styles.statValue}>24</p>
            <p className={styles.statDescription}>8 magical items</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
