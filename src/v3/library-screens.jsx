import React, { useMemo, useRef, useState } from 'react';
import { Archive, CalendarDays, Check, ChevronRight, CircleHelp, Download, PackageOpen, Pencil, Play, Plus, Search, Settings, Shirt, Tag, Upload } from 'lucide-react';
import { DEFAULT_ADVICE } from './data.js';
import { useAppStore } from './store.js';
import { CategoryBadge, ICONS, categoryFor } from './ui.jsx';

export function TasksScreen({ onEdit, onOpenCapture, onManageCategories }) {
  const tasks = useAppStore((state) => state.tasks);
  const categories = useAppStore((state) => state.categories);
  const startTask = useAppStore((state) => state.startTask);
  const session = useAppStore((state) => state.session);
  const setActiveTask = useAppStore((state) => state.setActiveTask);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const startSelectedTask = (taskId, version) => {
    if (session && session.taskId !== taskId && !window.confirm('Starting another task will end the currently saved session. Continue?')) return;
    startTask(taskId, version);
  };
  const filtered = useMemo(() => tasks.filter((task) => {
    const category = categoryFor(categories, task.category);
    const haystack = `${task.title} ${task.minimum} ${category.label}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (filter === 'all' || task.type === filter || task.mode === filter);
  }), [tasks, categories, query, filter]);

  return (
    <section className="screen list-screen">
      <div className="page-heading"><div><p className="eyebrow">Task library</p><h1>Choose, add or change a task.</h1></div><div className="page-actions"><button className="secondary-action" onClick={onManageCategories}><Tag size={17} /> Categories</button><button className="primary-action" onClick={onOpenCapture}><Plus size={17} /> Add task</button></div></div>
      <label className="search-box"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks or categories" /></label>
      <div className="filter-row" aria-label="Task filters">
        {[['all', 'All'], ['recovery', 'Room reset'], ['maintenance', 'Maintenance'], ['oneoff', 'One-off']].map(([id, label]) => <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>)}
      </div>
      <div className="task-list">
        {filtered.map((task) => {
          const category = categoryFor(categories, task.category);
          const Icon = ICONS[category.icon] || Tag;
          return (
            <article key={task.id} className={`task-row tone-${category.tone}`}>
              <span className="task-row-icon"><Icon size={21} /></span>
              <button className="task-row-copy" onClick={() => setActiveTask(task.id)}>
                <CategoryBadge categoryId={task.category} /><h2>{task.title}</h2><p>{task.minimum}</p>
                {task.preserve && <small className="preserve-label">Protection check before starting</small>}
              </button>
              <div className="task-row-actions">
                <button className="small-primary" onClick={() => startSelectedTask(task.id, 'minimum')}><Play size={16} /> Start</button>
                <button className="small-secondary" onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`}><Pencil size={17} /></button>
              </div>
            </article>
          );
        })}
        {filtered.length === 0 && <p className="empty-copy">No matching tasks.</p>}
      </div>
    </section>
  );
}

export function AdviceScreen({ onOpenAdvice }) {
  return (
    <section className="screen list-screen">
      <div className="page-heading"><div><p className="eyebrow">Advice</p><h1>Find the method when you need it.</h1></div></div>
      <div className="advice-grid">
        {DEFAULT_ADVICE.map((item) => (
          <article className="advice-card" key={item.id}>
            <span>{item.type}</span><h2>{item.title}</h2><p>{item.summary}</p>
            <button onClick={() => onOpenAdvice(item)}>Open advice <ChevronRight size={17} /></button>
          </article>
        ))}
      </div>
    </section>
  );
}

export function WardrobeScreen({ onAdd, onEdit }) {
  const wardrobe = useAppStore((state) => state.wardrobe);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const items = wardrobe.filter((item) => {
    const matches = `${item.name} ${item.location} ${item.kind}`.toLowerCase().includes(query.toLowerCase());
    return matches && (filter === 'all' || item.status === filter);
  });
  return (
    <section className="screen list-screen">
      <div className="page-heading"><div><p className="eyebrow">Wardrobe</p><h1>Know what you have and where it lives.</h1></div><button className="primary-action" onClick={onAdd}><Plus size={17} /> Add item</button></div>
      <label className="search-box"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search clothing or location" /></label>
      <div className="filter-row">{[['all','All'],['current','Current wardrobe'],['reserve','Reserve']].map(([id,label]) => <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>)}</div>
      {items.length === 0 ? <section className="empty-card"><Shirt size={34} /><h2>{wardrobe.length ? 'No matching clothing' : 'No wardrobe items yet'}</h2><p>Add a photo, item name and location. Reserve clothing stays separate from the current wardrobe.</p><button className="primary-action" onClick={onAdd}>Add first item</button></section> : (
        <div className="wardrobe-grid">{items.map((item) => <button key={item.id} className="wardrobe-card" onClick={() => onEdit(item)}>{item.photo ? <img src={item.photo} alt="" /> : <span className="wardrobe-placeholder"><Shirt size={34} /></span>}<span className="wardrobe-copy"><small>{item.status === 'reserve' ? 'Reserve' : 'Current wardrobe'}</small><strong>{item.name}</strong><span>{item.location || 'No location saved'}</span></span></button>)}</div>
      )}
    </section>
  );
}

export function SettingsScreen() {
  const appearance = useAppStore((state) => state.appearance);
  const calmView = useAppStore((state) => state.calmView);
  const textScale = useAppStore((state) => state.textScale);
  const reducedMotion = useAppStore((state) => state.reducedMotion);
  const setAppearance = useAppStore((state) => state.setAppearance);
  const setCalmView = useAppStore((state) => state.setCalmView);
  const setTextScale = useAppStore((state) => state.setTextScale);
  const setReducedMotion = useAppStore((state) => state.setReducedMotion);
  const migratedFrom = useAppStore((state) => state.migratedFrom);
  return (
    <section className="screen list-screen">
      <div className="page-heading"><div><p className="eyebrow">Settings & connections</p><h1>Keep controls out of the cleaning flow.</h1></div></div>
      <div className="settings-grid">
        <section className="settings-card"><h2>Appearance</h2><p>Use the device theme or choose a fixed light or dark view.</p><div className="segmented three">{['system','light','dark'].map((value) => <button key={value} className={appearance === value ? 'active' : ''} onClick={() => setAppearance(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}</div></section>
        <section className="settings-card"><h2>Calm view</h2><p>Reduce decorative gradients and shadows while keeping category labels, icons and colour names visible.</p><label className="settings-toggle"><input type="checkbox" checked={calmView} onChange={(event) => setCalmView(event.target.checked)} /><span><strong>{calmView ? 'Calm view is on' : 'Calm view is off'}</strong><small>Colour never carries meaning alone.</small></span></label></section>
        <section className="settings-card"><h2>Text size</h2><p>Make ordinary text and controls larger without changing the task wording.</p><div className="segmented"><button className={textScale === 'normal' ? 'active' : ''} onClick={() => setTextScale('normal')}>Standard</button><button className={textScale === 'large' ? 'active' : ''} onClick={() => setTextScale('large')}>Large</button></div></section>
        <section className="settings-card"><h2>Motion</h2><p>Short transitions are optional and never required to understand the app.</p><label className="settings-toggle"><input type="checkbox" checked={reducedMotion} onChange={(event) => setReducedMotion(event.target.checked)} /><span><strong>{reducedMotion ? 'Reduced motion is on' : 'Use short transitions'}</strong><small>The device reduced-motion setting is always respected.</small></span></label></section>
        <section className="settings-card"><h2>Calendar</h2><p>Not connected in this branch. Cleaning instructions remain in Life Manager; Calendar will receive links, dates and status only.</p><button disabled className="secondary-action"><CalendarDays size={17} /> Connection not available yet</button></section>
        <section className="settings-card"><h2>Esslay</h2><p>Not connected in this branch. Later integration will use schedule, status and reward metadata rather than duplicate task instructions.</p><button disabled className="secondary-action">Connection not available yet</button></section>
        {migratedFrom && <section className="settings-card success"><h2>Previous data found</h2><p>Data was carried forward from <code>{migratedFrom}</code>.</p></section>}
      </div>
    </section>
  );
}

export function MoreScreen({ onOpenIndex, onWardrobe, onSettings }) {
  const history = useAppStore((state) => state.history);
  const state = useAppStore();
  const fileInputRef = useRef(null);
  const importState = useAppStore((store) => store.importState);

  const exportBackup = () => {
    const payload = { tasks: state.tasks, categories: state.categories, history: state.history, wardrobe: state.wardrobe, activeTaskId: state.activeTaskId, session: state.session, appearance: state.appearance, calmView: state.calmView, textScale: state.textScale, reducedMotion: state.reducedMotion };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `life-manager-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const importBackup = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try { importState(JSON.parse(await file.text())); } catch { window.alert('That backup file could not be read.'); }
    event.target.value = '';
  };

  return (
    <section className="screen list-screen">
      <div className="page-heading"><div><p className="eyebrow">More</p><h1>Useful tools that do not belong on Today.</h1></div></div>
      <div className="more-grid">
        <button className="more-card" onClick={onOpenIndex}><CircleHelp /><span><strong>Index / I’m lost</strong><small>Find any action in ordinary wording</small></span><ChevronRight /></button>
        <button className="more-card" onClick={onWardrobe}><PackageOpen /><span><strong>Wardrobe</strong><small>Clothing photos, locations and reserve</small></span><ChevronRight /></button>
        <button className="more-card" onClick={onSettings}><Settings /><span><strong>Settings & connections</strong><small>Appearance, Calendar and Esslay status</small></span><ChevronRight /></button>
        <button className="more-card" onClick={exportBackup}><Download /><span><strong>Export backup</strong><small>Save tasks, categories, wardrobe and history</small></span><ChevronRight /></button>
        <button className="more-card" onClick={() => fileInputRef.current?.click()}><Upload /><span><strong>Import backup</strong><small>Restore a previous Life Manager file</small></span><ChevronRight /></button>
        <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={importBackup} />
      </div>
      <section className="history-section"><h2>Recent completions</h2>{history.length === 0 ? <p className="empty-copy">Nothing completed in this rebuild yet.</p> : history.slice(0, 10).map((record) => <div className="history-row" key={record.id}><span className="history-check"><Check size={16} /></span><div><strong>{record.title}</strong><small>{record.result} · {new Date(record.completedAt).toLocaleString('en-GB')}</small></div></div>)}</section>
    </section>
  );
}
