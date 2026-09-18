import { createElement } from 'react';
import { NavLink } from 'react-router';
import { Download, Music, Tags, User, Video } from 'lucide-react';
import styles from './BottomNav.module.scss';

const ITEMS = [
  { to: '/', label: 'Videos', icon: Video, end: true },
  { to: '/audio', label: 'Audio', icon: Music },
  { to: '/download', label: 'Download', icon: Download },
  { to: '/tags', label: 'Tags', icon: Tags },
  { to: '/account', label: 'Account', icon: User },
];

export default function NavLinks({ variant = 'bottom' }) {
  return ITEMS.map((item) => (
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
