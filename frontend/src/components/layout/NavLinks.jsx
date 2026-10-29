import { createElement, useState, useEffect } from 'react';
import { NavLink } from 'react-router';
import { Download, LayoutDashboard, Music, Settings, Tags, User, Video } from 'lucide-react';
import { api } from '../../lib/axios';
import styles from './BottomNav.module.scss';

const ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/', label: 'Videos', icon: Video, end: true },
  { to: '/audio', label: 'Audio', icon: Music },
  { to: '/download', label: 'Download', icon: Download },
  { to: '/tags', label: 'Tags', icon: Tags },
  { to: '/account', label: 'Account', icon: User },
];

const MOBILE_PRIMARY = new Set(['/', '/audio', '/download', '/tags']);

export function useNavItems() {
  const [navItems, setNavItems] = useState(ITEMS);
  useEffect(() => {
    api.get('/initialize/checkLegacyUpdateEnabled').then((r) => {
      if (r.data.enabled) {
        setNavItems([...ITEMS, { to: '/legacy', label: 'Legacy', icon: Settings }]);
      }
    }).catch(() => {});
  }, []);
  return navItems;
}

export function splitMobileNavItems(items) {
  const primary = [];
  const overflow = [];
  for (const item of items) {
    if (MOBILE_PRIMARY.has(item.to)) primary.push(item);
    else overflow.push(item);
  }
  return { primary, overflow };
}

export function pathMatchesItem(item, pathname) {
  if (item.end) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

export default function NavLinks({ variant = 'bottom', items }) {
  return items.map((item) => (
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
          <span className={styles.label}>{item.label}</span>
        </>
      )}
    </NavLink>
  ));
}
