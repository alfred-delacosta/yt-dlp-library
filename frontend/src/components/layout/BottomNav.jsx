import NavLinks from './NavLinks';
import styles from './BottomNav.module.scss';

export default function BottomNav() {
  return (
    <>
      <nav className={styles.nav} aria-label="Primary">
        <NavLinks variant="bottom" />
      </nav>
      <nav className={styles.rail} aria-label="Primary">
        <NavLinks variant="rail" />
      </nav>
    </>
  );
}
