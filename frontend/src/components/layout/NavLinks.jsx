import { createElement, useState, useEffect } from 'react';
import { NavLink } from 'react-router';
import { Download, Music, Settings, Tags, User, Video } from 'lucide-react';
import { api } from '../../lib/axios';
import styles from './BottomNav.module.scss';

const ITEMS = [
  { to: '/', label: 'Videos', icon: Video, end: true },
  { to: '/audio', label: 'Audio', icon: Music },
  { to: '/download', label: 'Download', icon: Download },
  { to: '/tags', label: 'Tags', icon: Tags },
  { to: '/account', label: 'Account', icon: User },
];

export default function NavLinks({ variant = 'bottom' }) {
  const [navItems, setNavItems] = useState(ITEMS);
  useEffect(() => {
    api.get('/initialize/checkLegacyUpdateEnabled').then((r) => {
      if (r.data.enabled) {
        setNavItems([...ITEMS, { to: '/legacy', label: 'Legacy', icon: Settings }]);
      }
    }).catch(() => {});
  }, []);
  return navItems.map((item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
    >
      {({ isActive }) => (
        <>
          {variant === 'bottom' && isActive && <span className={styles.indicator} />}
          {createElement(item.icon, { size: 20 })}
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  ));
}
