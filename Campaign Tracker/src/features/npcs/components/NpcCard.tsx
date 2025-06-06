import { Npc } from '../types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Pencil, Trash2, MapPin } from 'lucide-react';
import clsx from 'clsx';
import styles from './NpcCard.module.scss';

interface NpcCardProps {
  npc: Npc;
  onEdit: (npc: Npc) => void;
  onDelete: (id: string) => void;
}

export function NpcCard({ npc, onEdit, onDelete }: NpcCardProps) {
  return (
    <Card className={styles.npcCard}>
      <div className={styles.npcHeader}>
        <div className={styles.avatar}>
          <User size={24} />
        </div>
        <div className={styles.npcInfo}>
          <h3 className={styles.npcName}>{npc.name}</h3>
          <div className={styles.npcMeta}>
            {npc.race && <span>{npc.race}</span>}
            {npc.gender && <span>{npc.gender}</span>}
            {npc.age && <span>{npc.age} years</span>}
            <span className={clsx(styles.status, { [styles.alive]: npc.isAlive, [styles.dead]: !npc.isAlive })}>
              {npc.isAlive ? 'Alive' : 'Deceased'}
            </span>
          </div>
        </div>
      </div>
      
      <div className={styles.npcDetails}>
        {(npc.occupation || npc.location) && (
          <div className={styles.detailRow}>
            {npc.occupation && <span>{npc.occupation}</span>}
            {npc.location && (
              <span className={styles.location}>
                <MapPin size={14} /> {npc.location}
              </span>
            )}
          </div>
        )}
        
        {npc.affiliation && (
          <div className={styles.detailRow}>
            <span className={styles.affiliation}>{npc.affiliation}</span>
          </div>
        )}
        
        {npc.description && (
          <p className={styles.description}>
            {npc.description.length > 150 
              ? `${npc.description.substring(0, 150)}...` 
              : npc.description}
          </p>
        )}
      </div>
      
      <div className={styles.actions}>
        <Button 
          variant="ghost" 
          size="small" 
          onClick={() => onEdit(npc)}
        >
          <Pencil size={16} className={styles.buttonIcon} />
          <span>Edit</span>
        </Button>
        <Button 
          variant="ghost" 
          size="small" 
          onClick={() => onDelete(npc.id)}
          className={styles.deleteButton}
        >
          <Trash2 size={16} className={styles.buttonIcon} />
          <span>Delete</span>
        </Button>
      </div>
    </Card>
  );
}
