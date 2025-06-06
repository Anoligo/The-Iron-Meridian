import { Link, useLocation } from 'react-router-dom';
import { Home, Swords, Users, MapPin, Gem, Shield, User, BookOpen, Settings as SettingsIcon } from 'lucide-react';
import { useState } from 'react';
import styles from './Sidebar.module.scss';
import clsx from 'clsx';

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/quests', icon: Swords, label: 'Quests' },
  { path: '/characters', icon: Users, label: 'Characters' },
  { path: '/locations', icon: MapPin, label: 'Locations' },
  { path: '/loot', icon: Gem, label: 'Loot' },
  { path: '/factions', icon: Shield, label: 'Factions' },
  { path: '/npcs', icon: User, label: 'NPCs' },
  { path: '/notes', icon: BookOpen, label: 'Notes' },
  { path: '/settings', icon: SettingsIcon, label: 'Settings' },
];

export function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={clsx(styles.sidebar, { [styles.collapsed]: isCollapsed })}>
      <div className={styles.sidebarHeader}>
        {!isCollapsed && <h2>Iron Meridian</h2>}
        <button 
          onClick={toggleSidebar} 
          className={styles.sidebarToggle} 
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? '>' : '<'}
        </button>
      </div>
      <nav className={styles.sidebarNav}>
        <ul>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={clsx(styles.navLink, { [styles.active]: isActive })}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={styles.navIcon} aria-hidden="true" />
                  {!isCollapsed && <span className={styles.navText}>{item.label}</span>}
                  {isCollapsed && <span className={styles.srOnly}>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
