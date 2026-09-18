import { Outlet } from 'react-router';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import styles from './AppShell.module.scss';

export default function AppShell() {
  return (
    <div className={styles.shell}>
      <TopBar />
      <BottomNav />
      <main className={`${styles.main} route-fade`}>
        <Outlet />
      </main>
    </div>
  );
}
