import { useCallback, useEffect, useMemo, useState, Suspense } from 'react';
import { demoCategories, demoRegistry, findDemo, type DemoCategory } from './demo-registry';
import './style.css';

function readRouteDemoId(): string | undefined {
  const match = window.location.hash.match(/^#\/demos\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

function App() {
  const [searchText, setSearchText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [routeDemoId, setRouteDemoId] = useState<string | undefined>(() => readRouteDemoId());

  const activeDemo = useMemo(() => findDemo(routeDemoId), [routeDemoId]);
  const activeIndex = useMemo(() => demoRegistry.findIndex((demo) => demo.id === activeDemo.id), [activeDemo.id]);

  const filteredDemos = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return demoRegistry;
    return demoRegistry.filter((demo) =>
      [demo.title, demo.description, demo.id, demo.category].some((value) => value.toLowerCase().includes(keyword)),
    );
  }, [searchText]);

  const groupedDemos = useMemo(
    () =>
      demoCategories.reduce(
        (groups, category) => {
          groups[category] = filteredDemos.filter((demo) => demo.category === category);
          return groups;
        },
        {} as Record<DemoCategory, typeof demoRegistry>,
      ),
    [filteredDemos],
  );

  const visibleCategories = demoCategories.filter((category) => groupedDemos[category].length > 0);

  const selectDemo = useCallback(
    (id: string) => {
      if (id === activeDemo.id) {
        setSidebarOpen(false);
        return;
      }
      window.location.hash = `/demos/${encodeURIComponent(id)}`;
      setSidebarOpen(false);
    },
    [activeDemo.id],
  );

  useEffect(() => {
    const syncRoute = () => {
      setRouteDemoId(readRouteDemoId());
      setSidebarOpen(false);
    };
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        document.querySelector<HTMLInputElement>('.search-box input')?.focus();
      }
    };
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('keydown', focusSearch);
    return () => {
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('keydown', focusSearch);
    };
  }, []);

  const ActiveComponent = activeDemo.component;

  return (
    <div className="playground">
      <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <a className="brand" href="#/demos/start-with-renderer" onClick={() => setSidebarOpen(false)}>
            <span className="brand-mark" aria-hidden="true">
              R
            </span>
            <span>
              <strong>GenUI</strong>
              <small>React Playground</small>
            </span>
          </a>
          <button className="icon-button sidebar-close" type="button" aria-label="关闭 demo 列表" onClick={() => setSidebarOpen(false)}>
            ×
          </button>
        </div>

        <div className="sidebar-intro">
          <div className="eyebrow">EXAMPLES / {demoRegistry.length}</div>
          <h1>探索全部 Demo</h1>
          <p>选择一个案例，立即查看 GenUI SDK React 的能力。</p>
        </div>

        <label className="search-box">
          <span className="search-icon" aria-hidden="true">
            ⌕
          </span>
          <input
            type="search"
            value={searchText}
            placeholder="搜索 demo"
            aria-label="搜索 demo"
            onChange={(event) => setSearchText(event.target.value)}
          />
          {!searchText && <kbd>⌘ K</kbd>}
        </label>

        <nav className="demo-nav" aria-label="Demo 列表">
          {visibleCategories.map((category) => (
            <section key={category} className="demo-group">
              <div className="group-title">
                <span>{category}</span>
                <span className="group-count">{groupedDemos[category].length}</span>
              </div>
              {groupedDemos[category].map((demo) => (
                <button
                  key={demo.id}
                  className={`demo-link${demo.id === activeDemo.id ? ' active' : ''}`}
                  type="button"
                  onClick={() => selectDemo(demo.id)}
                >
                  <span className={`demo-dot dot-${demoCategories.indexOf(category) + 1}`} aria-hidden="true" />
                  <span className="demo-link-copy">
                    <strong>{demo.title}</strong>
                    <small>{demo.description}</small>
                  </span>
                  {demo.id === activeDemo.id && (
                    <span className="active-indicator" aria-hidden="true">
                      ↗
                    </span>
                  )}
                </button>
              ))}
            </section>
          ))}
          {visibleCategories.length === 0 && <div className="empty-search">没有找到匹配的 demo</div>}
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot" aria-hidden="true" />
          <span>React playground</span>
          <span className="footer-version">v1.4</span>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <button className="icon-button menu-button" type="button" aria-label="打开 demo 列表" onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
          <div className="breadcrumbs">
            <span>Playground</span>
            <span className="breadcrumb-divider">/</span>
            <span className="breadcrumb-current">{activeDemo.title}</span>
          </div>
          <div className="topbar-actions">
            <span className="route-hint">{activeDemo.category}</span>
            <a className="source-link" href="https://github.com/opentiny/genui-sdk" target="_blank" rel="noreferrer">
              SDK docs <span aria-hidden="true">↗</span>
            </a>
          </div>
        </header>

        <main className="demo-area" onClick={() => setSidebarOpen(false)}>
          <div className="demo-heading">
            <div>
              <div className="demo-overline">
                {activeDemo.category} · {activeDemo.id}
              </div>
              <h2>{activeDemo.title}</h2>
              <p>{activeDemo.description}</p>
            </div>
            <div className="demo-counter">
              <span className="counter-current">{String(activeIndex + 1).padStart(2, '0')}</span>
              <span className="counter-slash">/</span>
              <span>{String(demoRegistry.length).padStart(2, '0')}</span>
            </div>
          </div>

          <div className="demo-frame">
            <Suspense
              fallback={
                <div className="loading-state">
                  <span className="loading-spinner" aria-hidden="true" />
                  正在载入 {activeDemo.title}…
                </div>
              }
            >
              <ActiveComponent key={activeDemo.id} />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
