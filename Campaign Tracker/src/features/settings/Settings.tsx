import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import styles from './Settings.module.scss';

export function Settings() {
  const [theme, setTheme] = useState('dark');
  const [autoSave, setAutoSave] = useState(true);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    // TODO: Apply theme change
  };

  const handleAutoSaveToggle = () => {
    setAutoSave(!autoSave);
    // TODO: Toggle auto-save functionality
  };

  return (
    <div className={styles.settingsPage}>
      <h1>Settings</h1>
      <Card>
        <div className={styles.settingsSection}>
          <h2>Appearance</h2>
          <div className={styles.formGroup}>
            <label>Theme</label>
            <div className={styles.themeOptions}>
              <button
                className={`${styles.themeOption} ${theme === 'light' ? styles.active : ''}`}
                onClick={() => handleThemeChange('light')}
              >
                Light
              </button>
              <button
                className={`${styles.themeOption} ${theme === 'dark' ? styles.active : ''}`}
                onClick={() => handleThemeChange('dark')}
              >
                Dark
              </button>
              <button
                className={`${styles.themeOption} ${theme === 'high-contrast' ? styles.active : ''}`}
                onClick={() => handleThemeChange('high-contrast')}
              >
                High Contrast
              </button>
            </div>
          </div>
        </div>

        <div className={styles.settingsSection}>
          <h2>Data Management</h2>
          <div className={styles.formGroup}>
            <div className={styles.toggleGroup}>
              <label>Auto-save changes</label>
              <div 
                className={`${styles.toggle} ${autoSave ? styles.on : ''}`}
                onClick={handleAutoSaveToggle}
              >
                <div className={styles.toggleSwitch} />
              </div>
            </div>
          </div>
          <div className={styles.formGroup}>
            <Button variant="primary">Export Data</Button>
            <Button variant="secondary">Import Data</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
