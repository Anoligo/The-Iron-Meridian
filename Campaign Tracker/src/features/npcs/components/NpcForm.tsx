import { useForm } from 'react-hook-form';
import { Npc, NpcFormData } from '../types';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select, Checkbox } from '@/components/ui/Form/index';
import styles from './NpcForm.module.scss';

interface NpcFormProps {
  initialData?: Partial<Npc>;
  onSubmit: (data: NpcFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  availableRaces?: string[];
  availableLocations?: string[];
}

export function NpcForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  availableRaces = [],
  availableLocations = [],
}: NpcFormProps) {
  const isEditing = !!initialData?.id;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NpcFormData>({
    defaultValues: {
      name: initialData?.name || '',
      race: initialData?.race || '',
      gender: initialData?.gender || 'Other',
      age: initialData?.age,
      occupation: initialData?.occupation || '',
      location: initialData?.location || '',
      affiliation: initialData?.affiliation || '',
      description: initialData?.description || '',
      personality: initialData?.personality || '',
      appearance: initialData?.appearance || '',
      notes: initialData?.notes || '',
      isAlive: initialData?.isAlive !== false,
    },
  });

  const handleFormSubmit = async (data: NpcFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.npcForm}>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <Input
            label="Name *"
            id="name"
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
            disabled={isLoading}
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            label="Race"
            id="race"
            list="races"
            {...register('race')}
            disabled={isLoading}
          />
          {availableRaces.length > 0 && (
            <datalist id="races">
              {availableRaces.map((race) => (
                <option key={race} value={race} />
              ))}
            </datalist>
          )}
        </div>

        <div className={styles.formGroup}>
          <Select
            label="Gender"
            id="gender"
            {...register('gender')}
            disabled={isLoading}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Other">Other</option>
          </Select>
        </div>

        <div className={styles.formGroup}>
          <Input
            label="Age"
            id="age"
            type="number"
            min="0"
            {...register('age', { valueAsNumber: true })}
            disabled={isLoading}
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            label="Occupation"
            id="occupation"
            {...register('occupation')}
            disabled={isLoading}
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            label="Location"
            id="location"
            list="locations"
            {...register('location')}
            disabled={isLoading}
          />
          {availableLocations.length > 0 && (
            <datalist id="locations">
              {availableLocations.map((location) => (
                <option key={location} value={location} />
              ))}
            </datalist>
          )}
        </div>

        <div className={styles.formGroup}>
          <Input
            label="Affiliation"
            id="affiliation"
            {...register('affiliation')}
            disabled={isLoading}
          />
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <Textarea
            label="Description *"
            id="description"
            rows={3}
            {...register('description', { required: 'Description is required' })}
            error={errors.description?.message}
            disabled={isLoading}
          />
        </div>

        <div className={`${styles.formGroup} ${styles.halfWidth}`}>
          <Textarea
            label="Personality"
            id="personality"
            rows={3}
            {...register('personality')}
            disabled={isLoading}
          />
        </div>

        <div className={`${styles.formGroup} ${styles.halfWidth}`}>
          <Textarea
            label="Appearance"
            id="appearance"
            rows={3}
            {...register('appearance')}
            disabled={isLoading}
          />
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <Textarea
            label="Notes"
            id="notes"
            rows={3}
            {...register('notes')}
            disabled={isLoading}
          />
        </div>

        <div className={styles.formGroup}>
          <Checkbox
            id="isAlive"
            label="Is Alive"
            {...register('isAlive')}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className={styles.formActions}>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEditing ? 'Update NPC' : 'Create NPC'}
        </Button>
      </div>
    </form>
  );
}
