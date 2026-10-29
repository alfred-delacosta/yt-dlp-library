import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Music, Video } from 'lucide-react';
import { fetchStats } from '../lib/tags';
import { formatDate, mediaUrl } from '../lib/media';
import { OPTION_LABELS, OPTION_ORDER, formatMonthLabel, readChartTheme } from '../lib/chartTheme';
import page from './pages.module.scss';
import styles from './Dashboard.module.scss';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function useThemeKey() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');
  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setTheme(root.dataset.theme || 'light');
    });
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  return theme;
}

function chartDefaults(theme) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: theme.text,
          font: { family: theme.font, weight: '600', size: 12 },
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        backgroundColor: theme.surface,
        titleColor: theme.text,
        bodyColor: theme.text,
        borderColor: theme.border,
        borderWidth: 1,
      },
    },
  };
}

export default function Dashboard() {
  const themeKey = useThemeKey();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchStats();
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load dashboard stats.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const theme = readChartTheme();
  const empty = stats && stats.videoCount === 0 && stats.mp3Count === 0;

  const optionCounts = useMemo(() => {
    const map = Object.fromEntries((stats?.downloadOptions || []).map((row) => [row.option, row.count]));
    return OPTION_ORDER
      .filter((option) => option !== 'unknown' || (map.unknown || 0) > 0)
      .map((option) => ({ option, label: OPTION_LABELS[option] || option, count: map[option] || 0 }));
  }, [stats]);

  const baseOptions = useMemo(() => chartDefaults(theme), [theme]);

  const libraryDoughnut = useMemo(() => ({
    labels: ['Videos', 'Audio'],
    datasets: [{
      data: [stats?.videoCount || 0, stats?.mp3Count || 0],
      backgroundColor: [theme.accent, theme.success],
      borderColor: theme.surface,
      borderWidth: 2,
    }],
  }), [stats, theme]);

  const optionBar = useMemo(() => ({
    labels: optionCounts.map((row) => row.label),
    datasets: [{
      label: 'Downloads',
      data: optionCounts.map((row) => row.count),
      backgroundColor: theme.accent,
      borderRadius: 8,
    }],
  }), [optionCounts, theme]);

  const monthBar = useMemo(() => ({
    labels: (stats?.downloadsByMonth || []).map((row) => formatMonthLabel(row.month)),
    datasets: [
      {
        label: 'Videos',
        data: (stats?.downloadsByMonth || []).map((row) => row.videos),
        backgroundColor: theme.accent,
        borderRadius: 6,
      },
      {
        label: 'Audio',
        data: (stats?.downloadsByMonth || []).map((row) => row.mp3s),
        backgroundColor: theme.success,
        borderRadius: 6,
      },
    ],
  }), [stats, theme]);

  const tagBar = useMemo(() => ({
    labels: (stats?.tagUsage || []).map((row) => row.name),
    datasets: [{
      label: 'Items',
      data: (stats?.tagUsage || []).map((row) => row.count),
      backgroundColor: theme.accent,
      borderRadius: 8,
    }],
  }), [stats, theme]);

  const subtitleDoughnut = useMemo(() => ({
    labels: ['With subtitles', 'Without subtitles'],
    datasets: [{
      data: [stats?.subtitleCoverage?.with || 0, stats?.subtitleCoverage?.without || 0],
      backgroundColor: [theme.accent, theme.surface2],
      borderColor: theme.surface,
      borderWidth: 2,
    }],
  }), [stats, theme]);

  const scaleOptions = useMemo(() => ({
    ...baseOptions,
    scales: {
      x: {
        ticks: { color: theme.muted, font: { family: theme.font, size: 11 } },
        grid: { color: theme.border },
        border: { color: theme.border },
      },
      y: {
        beginAtZero: true,
        ticks: { color: theme.muted, precision: 0, font: { family: theme.font, size: 11 } },
        grid: { color: theme.border },
        border: { color: theme.border },
      },
    },
  }), [baseOptions, theme]);

  const doughnutOptions = useMemo(() => ({
    ...baseOptions,
    cutout: '64%',
  }), [baseOptions]);

  const noLegendOptions = useMemo(() => ({
    ...scaleOptions,
    plugins: { ...scaleOptions.plugins, legend: { display: false } },
  }), [scaleOptions]);

  const horizontalOptions = useMemo(() => ({
    ...noLegendOptions,
    indexAxis: 'y',
  }), [noLegendOptions]);

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={page.header}>
        <h1 className={page.title}>Dashboard</h1>
        <span className={page.count}>
          {stats ? `${stats.videoCount + stats.mp3Count} items` : 'Library overview'}
        </span>
      </div>
      {error && <p className={page.error}>{error}</p>}
      {loading && !stats ? (
        <p className={page.count}>Loading…</p>
      ) : stats && (
        <>
          <div className={styles.kpis}>
            <article className={`${styles.kpi} rise-in`} style={{ '--i': 0 }}>
              <span className={page.count}>Videos</span>
              <strong>{stats.videoCount}</strong>
            </article>
            <article className={`${styles.kpi} rise-in`} style={{ '--i': 1 }}>
              <span className={page.count}>Audio</span>
              <strong>{stats.mp3Count}</strong>
            </article>
            <LastMediaCard
              label="Last video"
              item={stats.lastVideo}
              to={stats.lastVideo ? `/video/${stats.lastVideo.id}` : null}
              icon={<Video size={18} />}
              delay={2}
            />
            <LastMediaCard
              label="Last audio"
              item={stats.lastMp3}
              to={stats.lastMp3 ? `/mp3/${stats.lastMp3.id}` : null}
              icon={<Music size={18} />}
              delay={3}
            />
          </div>
          {empty ? (
            <div className={page.emptyState}>
              Nothing in the library yet. Download a video or audio file to see charts here.
            </div>
          ) : (
            <div className={styles.grid}>
              <section className={`${styles.chartCard} rise-in`} style={{ '--i': 4 }}>
                <h2 className={styles.chartTitle}>Library mix</h2>
                <div className={styles.chart}>
                  <Doughnut key={`mix-${themeKey}`} data={libraryDoughnut} options={doughnutOptions} />
                </div>
              </section>
              <section className={`${styles.chartCard} rise-in`} style={{ '--i': 5 }}>
                <h2 className={styles.chartTitle}>Download options</h2>
                <div className={styles.chart}>
                  <Bar key={`options-${themeKey}`} data={optionBar} options={noLegendOptions} />
                </div>
              </section>
              <section className={`${styles.chartCard} ${styles.wide} rise-in`} style={{ '--i': 6 }}>
                <h2 className={styles.chartTitle}>Downloads by month</h2>
                <div className={styles.chart}>
                  <Bar key={`month-${themeKey}`} data={monthBar} options={scaleOptions} />
                </div>
              </section>
              <section className={`${styles.chartCard} rise-in`} style={{ '--i': 7 }}>
                <h2 className={styles.chartTitle}>Top tags</h2>
                <div className={styles.chart}>
                  {(stats.tagUsage || []).length === 0 ? (
                    <p className={page.count}>No tags assigned yet.</p>
                  ) : (
                    <Bar key={`tags-${themeKey}`} data={tagBar} options={horizontalOptions} />
                  )}
                </div>
              </section>
              <section className={`${styles.chartCard} rise-in`} style={{ '--i': 8 }}>
                <h2 className={styles.chartTitle}>Subtitle coverage</h2>
                <div className={styles.chart}>
                  {stats.videoCount === 0 ? (
                    <p className={page.count}>No videos yet.</p>
                  ) : (
                    <Doughnut key={`subs-${themeKey}`} data={subtitleDoughnut} options={doughnutOptions} />
                  )}
                </div>
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LastMediaCard({ label, item, to, icon, delay }) {
  const body = (
    <>
      <span className={page.count}>{label}</span>
      {item ? (
        <div className={styles.lastBody}>
          {item.thumbnailPath ? (
            <img className={styles.thumb} src={mediaUrl(item.thumbnailPath)} alt="" />
          ) : (
            <div className={styles.thumbFallback}>{icon}</div>
          )}
          <div className={styles.lastMeta}>
            <strong>{item.name}</strong>
            <span>{formatDate(item.downloadDate)}</span>
          </div>
        </div>
      ) : (
        <strong className={styles.none}>None yet</strong>
      )}
    </>
  );

  if (to) {
    return (
      <Link className={`${styles.kpi} ${styles.last} rise-in`} style={{ '--i': delay }} to={to}>
        {body}
      </Link>
    );
  }

  return (
    <article className={`${styles.kpi} ${styles.last} rise-in`} style={{ '--i': delay }}>
      {body}
    </article>
  );
}
