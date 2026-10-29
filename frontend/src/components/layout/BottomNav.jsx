import { createElement, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Ellipsis } from 'lucide-react';
import ActionSheet from '../library/ActionSheet';
import NavLinks, { pathMatchesItem, splitMobileNavItems, useNavItems } from './NavLinks';
import styles from './BottomNav.module.scss';

export default function BottomNav() {
  const items = useNavItems();
  const { primary, overflow } = splitMobileNavItems(items);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = overflow.some((item) => pathMatchesItem(item, pathname));

  return (
    <>
      <nav className={styles.nav} aria-label="Primary">
        <NavLinks variant="bottom" items={primary} />
        {overflow.length > 0 && (
          <button
            type="button"
            className={`${styles.link} ${moreActive ? styles.linkActive : ''}`}
            aria-label="More"
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
            aria-current={moreActive ? 'page' : undefined}
            onClick={() => setMoreOpen(true)}
          >
            {moreActive && <span className={styles.indicator} />}
            <Ellipsis size={20} />
            <span className={styles.label}>More</span>
          </button>
        )}
      </nav>
      <nav className={styles.rail} aria-label="Primary">
        <NavLinks variant="rail" items={items} />
      </nav>
      <ActionSheet
        open={moreOpen}
        title="More"
        onClose={() => setMoreOpen(false)}
        actions={overflow.map((item) => ({
          id: item.to,
          label: item.label,
          icon: createElement(item.icon, { size: 18 }),
          active: pathMatchesItem(item, pathname),
          onClick: () => navigate(item.to),
        }))}
      />
    </>
  );
}
