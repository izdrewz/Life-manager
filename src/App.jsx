import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive, ArrowLeft, BookOpen, CalendarDays, Check, ChevronRight, CircleHelp,
  ClipboardList, Download, Home, ImagePlus, Layers3, ListTodo, Menu, MoreHorizontal,
  PackageOpen, Pencil, Play, Plus, Search, Settings, Shirt, Sparkles, Star, Tag,
  Trash2, Upload, Utensils, X,
} from 'lucide-react';
import { DEFAULT_ADVICE, PRESERVATION_OPTIONS, ROOM_CONDITIONS, TONES } from './data.js';
import { useAppStore } from './store.js';

const ICONS = {
  archive: Archive,
  home: Home,
  layers: Layers3,
  shirt: Shirt,
  sparkles: Sparkles,
  star: Star,
  tag: Tag,
  trash: Trash2,
  utensils: Utensils,
};

const NAV_ITEMS = [
  { id: 'today', label: 'Today', icon: Home },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'advice', label: 'Advice', icon: BookOpen },
  { id: 'more', label: 'More', icon: MoreHorizontal },
];

function categoryFor(categories, id) {
  return categories.find((item) => item.id === id) || categories.find((item) => item.id === 'organise') || {
    id: 'organise', label: 'Organisation', icon: 'archive', tone: 'slate',
  };
}

function CategoryBadge({ categoryId }) {
  const categories = useAppStore((state) => state.categories);
  const category = categoryFor(categories, categoryId);
  const Icon = ICONS[category.icon] || Tag;
  return (
    <span className={`category-badge tone-${category.tone}`}>
      <Icon size={15} aria-hidden="true" />
      {category.label}
    </span>
  );
}

function AppHeader({ onOpenIndex, onOpenCapture }) {
  return (
    <header className="app-header">
      <button className="brand-block" type="button" onClick={() => useAppStore.getState().setView('today')}>
        <span className="brand-mark" aria-hidden="true"><Sparkles size={19} /></span>
        <span className="brand-copy"><strong>Life Manager</strong><small>one useful action at a time</small></span>
      </button>
      <div className="header-actions">
        <button className="icon-text-button" onClick={onOpenCapture}><Plus size={18} /><span>Quick add</span></button>
        <button className="icon-button" onClick={onOpenIndex} aria-label="Open Index or I’m lost"><CircleHelp size={20} /></button>
      </div>
    </header>
  );
}

function Navigation({ view, onChange }) {
  return (
    <nav className="primary-nav" aria-label="Primary navigation">
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
        <button key={id} className={view === id ? 'active' : ''} onClick={() => onChange(id)}>
          <Icon size={21} aria-hidden="true" /><span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function FocusCard({ task, onStart }) {
  const categories = useAppStore((state) => state.categories);
  const category = categoryFor(categories, task.category);
  const Icon = ICONS[category.icon] || Tag;
  return (
    <article className={`focus-card tone-${category.tone}`}>
      <div className="focus-visual" aria-hidden="true"><Icon size={32} strokeWidth={2.2} /></div>
      <div className="focus-copy">
        <CategoryBadge categoryId={task.category} />
        <p className="overline">Current task</p>
        <h2>{task.title}</h2>
        <p className="start-line"><strong>First instruction:</strong> {task.steps[0]}</p>
      </div>
      <div className="focus-actions">
        <button className="primary-action" onClick={() => onStart(task.id, 'minimum')}><Play size={19} fill="currentColor" />{task.minimumLabel}</button>
        <button className="secondary-action" onClick={() => onStart(task.id, 'full')}>{task.fullLabel}<ChevronRight size={18} /></button>
      </div>
      <p className="counts-note">The smaller version counts as complete.</p>
    </article>
  );
}

function TodayScreen({ onOpenIndex, onOpenCapture, onChooseCondition }) {
  const tasks = useAppStore((state) => state.tasks);
  const activeTaskId = useAppStore((state) => state.activeTaskId);
  const startTask = useAppStore((state) => state.startTask);
  const setView = useAppStore((state) => state.setView);
  const task = tasks.find((item) => item.id === activeTaskId) || tasks[0];

  if (!task) return <section className="screen empty-screen"><h1>No tasks yet.</h1><button className="primary-action" onClick={onOpenCapture}>Add a task</button></section>;

  return (
    <section className="screen today-screen">
      <div className="welcome-row">
        <div><p className="eyebrow">Hello, Izzy</p><h1>Pick one useful thing.</h1></div>
        <button className="mobile-menu-button" onClick={onOpenIndex}><Menu size={21} /> Find anything</button>
      </div>
      <div className="today-layout">
        <FocusCard task={task} onStart={startTask} />
        <aside className="support-column" aria-label="Other routes">
          <section className="support-card warm">
            <div className="support-heading"><span className="mini-icon"><Sparkles size={18} /></span><div><p className="overline">Room state</p><h3>{task.mode === 'recovery' ? 'Room reset is active' : 'Keep the room usable'}</h3></div></div>
            <p>{task.mode === 'recovery' ? 'The ordered reset plan stays available without filling this screen.' : 'Choose only what needs attention now. Missed days do not build up.'}</p>
            <button onClick={() => setView('tasks')}>See the task library <ChevronRight size={17} /></button>
          </section>
          <div className="route-grid">
            <button className="route-card coral" onClick={onChooseCondition}><ClipboardList size={22} /><span><strong>What needs attention?</strong><small>Describe the room and get the matching task</small></span><ChevronRight size={18} /></button>
            <button className="route-card sage" onClick={onOpenCapture}><Plus size={22} /><span><strong>Add something quickly</strong><small>Save it first; details can wait</small></span><ChevronRight size={18} /></button>
            <button className="route-card blue" onClick={onOpenIndex}><CircleHelp size={22} /><span><strong>I’m lost</strong><small>Find a page, action or instruction</small></span><ChevronRight size={18} /></button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function PreservationPhase({ task, onConfirm, onLeave }) {
  const [selected, setSelected] = useState([]);
  const [safePlace, setSafePlace] = useState('');
  const toggle = (item) => setSelected((items) => items.includes(item) ? items.filter((entry) => entry !== item) : [...items, item]);
  const protectedItems = selected.length ? [...selected, safePlace.trim() ? `Safe place: ${safePlace.trim()}` : 'Safe place chosen'] : [];

  return (
    <section className="screen active-screen">
      <button className="back-link" onClick={onLeave}><ArrowLeft size={18} /> Save and leave</button>
      <div className="preservation-shell">
        <p className="eyebrow">Before {task.title.toLowerCase()}</p>
        <h1>Protect anything that must not be lost, damaged or moved by mistake.</h1>
        <p className="lead-copy">Select anything present in the area. The cleaning instructions begin after this check.</p>
        <div className="preservation-list">
          {PRESERVATION_OPTIONS.map((item) => (
            <button key={item} type="button" className={selected.includes(item) ? 'selected' : ''} onClick={() => toggle(item)}>
              <span className="check-box">{selected.includes(item) && <Check size={17} />}</span><span>{item}</span>
            </button>
          ))}
        </div>
        {selected.length > 0 && <label className="safe-place-field">Where will protected items wait?<input value={safePlace} onChange={(event) => setSafePlace(event.target.value)} placeholder="For example: top drawer or labelled box" /></label>}
        <div className="preservation-actions">
          <button className="primary-action" disabled={selected.length > 0 && !safePlace.trim()} onClick={() => onConfirm(protectedItems)}>{selected.length ? 'Protected — begin task' : 'Nothing here needs protecting'}</button>
          <button className="secondary-action" onClick={onLeave}>Not ready — leave task</button>
        </div>
      </div>
    </section>
  );
}

function ActiveTaskScreen() {
  const tasks = useAppStore((state) => state.tasks);
  const categories = useAppStore((state) => state.categories);
  const session = useAppStore((state) => state.session);
  const nextStep = useAppStore((state) => state.nextStep);
  const previousStep = useAppStore((state) => state.previousStep);
  const stopSession = useAppStore((state) => state.stopSession);
  const completeSession = useAppStore((state) => state.completeSession);
  const answerDishQuestion = useAppStore((state) => state.answerDishQuestion);
  const continueDishLoop = useAppStore((state) => state.continueDishLoop);
  const confirmPreservation = useAppStore((state) => state.confirmPreservation);
  const task = tasks.find((item) => item.id === session?.taskId);

  if (!task || !session) return null;
  if (session.phase === 'preservation') return <PreservationPhase task={task} onConfirm={confirmPreservation} onLeave={stopSession} />;

  const category = categoryFor(categories, task.category);
  const isDishQuestion = task.loop === 'dishes' && session.stepIndex === 2;
  const isFinalOrdinaryStep = task.loop !== 'dishes' && session.stepIndex === task.steps.length - 1;
  const currentStep = task.steps[session.stepIndex];

  return (
    <section className="screen active-screen">
      <button className="back-link" onClick={stopSession}><ArrowLeft size={18} /> Save and leave</button>
      <div className={`active-task-shell tone-${category.tone}`}>
        <div className="active-task-topline"><CategoryBadge categoryId={task.category} /><span>{session.version === 'minimum' ? 'Smaller version' : 'Full version'}</span></div>
        <p className="overline">{task.title}</p>
        <div className="step-counter">Step {session.stepIndex + 1} of {task.steps.length}</div>
        <h1>{currentStep}</h1>
        {session.protectedItems?.length > 0 && <details className="protected-summary"><summary>Protected before starting</summary><ul>{session.protectedItems.map((item) => <li key={item}>{item}</li>)}</ul></details>}

        {session.minimumDecision ? (
          <div className="decision-panel">
            <p>One load is done. Stopping here counts.</p>
            <button className="primary-action" onClick={() => completeSession('One safe load taken to the kitchen')}>Stop — one load counts</button>
            <button className="secondary-action" onClick={continueDishLoop}>Do another load</button>
          </div>
        ) : isDishQuestion ? (
          <div className="answer-grid">
            <button className="primary-action" onClick={() => answerDishQuestion(true)}><Check size={20} /> Yes — complete task</button>
            <button className="secondary-action" onClick={() => answerDishQuestion(false)}>No — {session.version === 'full' ? 'repeat steps 1 and 2' : 'choose whether to stop'}</button>
          </div>
        ) : (
          <div className="active-actions">
            {session.stepIndex > 0 && <button className="text-action" onClick={previousStep}>Back</button>}
            {isFinalOrdinaryStep ? <button className="primary-action" onClick={() => completeSession()}>Done <Check size={20} /></button> : <button className="primary-action" onClick={nextStep}>Done — next instruction <ChevronRight size={20} /></button>}
          </div>
        )}
      </div>
      <p className="active-help">Only the current instruction is shown. The rest stays out of sight until needed.</p>
    </section>
  );
}

function TasksScreen({ onEdit, onOpenCapture, onManageCategories }) {
  const tasks = useAppStore((state) => state.tasks);
  const categories = useAppStore((state) => state.categories);
  const startTask = useAppStore((state) => state.startTask);
  const setActiveTask = useAppStore((state) => state.setActiveTask);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
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
                <button className="small-primary" onClick={() => startTask(task.id, 'minimum')}><Play size={16} /> Start</button>
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

function AdviceScreen({ onOpenAdvice }) {
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

function WardrobeScreen({ onAdd, onEdit }) {
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

function SettingsScreen() {
  const appearance = useAppStore((state) => state.appearance);
  const setAppearance = useAppStore((state) => state.setAppearance);
  const migratedFrom = useAppStore((state) => state.migratedFrom);
  return (
    <section className="screen list-screen">
      <div className="page-heading"><div><p className="eyebrow">Settings & connections</p><h1>Keep controls out of the cleaning flow.</h1></div></div>
      <div className="settings-grid">
        <section className="settings-card"><h2>Appearance</h2><p>Use the device theme or choose a fixed view.</p><div className="segmented three">{['system','light','dark'].map((value) => <button key={value} className={appearance === value ? 'active' : ''} onClick={() => setAppearance(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}</div></section>
        <section className="settings-card"><h2>Calendar</h2><p>Not connected in this branch. Cleaning instructions remain in Life Manager; Calendar will receive links, dates and status only.</p><button disabled className="secondary-action"><CalendarDays size={17} /> Connection not available yet</button></section>
        <section className="settings-card"><h2>Esslay</h2><p>Not connected in this branch. Later integration will use schedule, status and reward metadata rather than duplicate task instructions.</p><button disabled className="secondary-action">Connection not available yet</button></section>
        {migratedFrom && <section className="settings-card success"><h2>Previous data found</h2><p>Data was carried forward from <code>{migratedFrom}</code>.</p></section>}
      </div>
    </section>
  );
}

function MoreScreen({ onOpenIndex, onWardrobe, onSettings }) {
  const history = useAppStore((state) => state.history);
  const state = useAppStore();
  const fileInputRef = useRef(null);
  const importState = useAppStore((store) => store.importState);

  const exportBackup = () => {
    const payload = { tasks: state.tasks, categories: state.categories, history: state.history, wardrobe: state.wardrobe, activeTaskId: state.activeTaskId, session: state.session, appearance: state.appearance };
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

function ModalFrame({ children, onClose, wide = false, className = '' }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><section className={`sheet ${wide ? 'wide-sheet' : ''} ${className}`} onMouseDown={(event) => event.stopPropagation()}><div className="sheet-handle" />{children}</section></div>;
}

function QuickCapture({ open, onClose, initialType = 'oneoff' }) {
  const addTask = useAppStore((state) => state.addTask);
  const categories = useAppStore((state) => state.categories);
  const [title, setTitle] = useState('');
  const [type, setType] = useState(initialType);
  const [category, setCategory] = useState('tidying');
  useEffect(() => { if (open) setType(initialType); else setTitle(''); }, [open, initialType]);
  if (!open) return null;
  const save = (event) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    addTask({ id: `personal-${Date.now()}`, title: trimmed, category, type, mode: type === 'oneoff' ? 'recovery' : 'maintenance', minimumLabel: 'Do the smaller version', fullLabel: 'Do the full version', minimum: 'Complete one useful part.', full: 'Complete the task as currently defined.', preserve: false, steps: [trimmed] });
    onClose();
  };
  return <div className="modal-backdrop" onMouseDown={onClose}><form className="sheet" onSubmit={save} onMouseDown={(event) => event.stopPropagation()}><div className="sheet-handle" /><div className="sheet-header"><div><p className="eyebrow">Quick capture</p><h2>Save it before it disappears.</h2></div><button type="button" className="icon-button" onClick={onClose}><X /></button></div><label>What do you need to remember?<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="For example: clear the chair" /></label><fieldset><legend>What kind?</legend><div className="segmented"><button type="button" className={type === 'oneoff' ? 'active' : ''} onClick={() => setType('oneoff')}>One-off</button><button type="button" className={type === 'permanent' ? 'active' : ''} onClick={() => setType('permanent')}>Permanent</button></div></fieldset><label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><p className="sheet-note">Only the name, type and category are required now. The full task can be edited from Tasks.</p><button className="primary-action" type="submit">Save task</button></form></div>;
}

function TaskEditor({ task, onClose }) {
  const categories = useAppStore((state) => state.categories);
  const updateTask = useAppStore((state) => state.updateTask);
  const deleteTask = useAppStore((state) => state.deleteTask);
  const [draft, setDraft] = useState(task);
  useEffect(() => setDraft(task), [task]);
  if (!task || !draft) return null;
  const setStep = (index, value) => setDraft({ ...draft, steps: draft.steps.map((step, stepIndex) => stepIndex === index ? value : step) });
  const save = (event) => { event.preventDefault(); updateTask({ ...draft, title: draft.title.trim() || task.title, steps: draft.steps.map((step) => step.trim()).filter(Boolean) }); onClose(); };
  const remove = () => { if (window.confirm(`Delete “${task.title}”?`)) { deleteTask(task.id); onClose(); } };
  return <div className="modal-backdrop" onMouseDown={onClose}><form className="sheet wide-sheet" onSubmit={save} onMouseDown={(event) => event.stopPropagation()}><div className="sheet-handle" /><div className="sheet-header"><div><p className="eyebrow">Edit task</p><h2>{task.title}</h2></div><button type="button" className="icon-button" onClick={onClose}><X /></button></div><div className="form-grid"><label>Task name<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label><label>Category<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>{categories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><fieldset><legend>Task type</legend><div className="segmented"><button type="button" className={draft.type === 'oneoff' ? 'active' : ''} onClick={() => setDraft({ ...draft, type: 'oneoff' })}>One-off</button><button type="button" className={draft.type === 'permanent' ? 'active' : ''} onClick={() => setDraft({ ...draft, type: 'permanent' })}>Permanent</button></div></fieldset><fieldset><legend>Room state</legend><div className="segmented"><button type="button" className={draft.mode === 'recovery' ? 'active' : ''} onClick={() => setDraft({ ...draft, mode: 'recovery' })}>Room reset</button><button type="button" className={draft.mode === 'maintenance' ? 'active' : ''} onClick={() => setDraft({ ...draft, mode: 'maintenance' })}>Maintenance</button></div></fieldset></div><label>Smaller button label<input value={draft.minimumLabel} onChange={(event) => setDraft({ ...draft, minimumLabel: event.target.value })} /></label><label>What the smaller version completes<textarea value={draft.minimum} onChange={(event) => setDraft({ ...draft, minimum: event.target.value })} /></label><label>Full button label<input value={draft.fullLabel} onChange={(event) => setDraft({ ...draft, fullLabel: event.target.value })} /></label><label>What the full version completes<textarea value={draft.full} onChange={(event) => setDraft({ ...draft, full: event.target.value })} /></label><fieldset><legend>Instructions</legend><div className="step-editor">{draft.steps.map((step, index) => <div key={index} className="step-editor-row"><span>{index + 1}</span><textarea value={step} onChange={(event) => setStep(index, event.target.value)} /><button type="button" className="icon-button" aria-label={`Remove instruction ${index + 1}`} onClick={() => setDraft({ ...draft, steps: draft.steps.filter((_, stepIndex) => stepIndex !== index) })}><X size={16} /></button></div>)}<button type="button" className="secondary-action" onClick={() => setDraft({ ...draft, steps: [...draft.steps, ''] })}><Plus size={17} /> Add instruction</button></div></fieldset><label className="checkbox-label"><input type="checkbox" checked={Boolean(draft.preserve)} onChange={(event) => setDraft({ ...draft, preserve: event.target.checked })} /><span><strong>Run the protection check first</strong><small>Use for moving piles, clearing surfaces, the bed, routes or floor zones.</small></span></label><div className="sheet-footer"><button className="primary-action" type="submit">Save changes</button>{task.createdByUser && <button type="button" className="danger-action" onClick={remove}><Trash2 size={17} /> Delete task</button>}</div></form></div>;
}

function CategoryManager({ open, onClose }) {
  const categories = useAppStore((state) => state.categories);
  const addCategory = useAppStore((state) => state.addCategory);
  const updateCategory = useAppStore((state) => state.updateCategory);
  const deleteCategory = useAppStore((state) => state.deleteCategory);
  const [label, setLabel] = useState('');
  const [tone, setTone] = useState('slate');
  if (!open) return null;
  const add = (event) => { event.preventDefault(); if (!label.trim()) return; addCategory({ label, tone }); setLabel(''); };
  return <ModalFrame onClose={onClose} wide><div className="sheet-header"><div><p className="eyebrow">Categories</p><h2>Keep task colours meaningful.</h2></div><button className="icon-button" onClick={onClose}><X /></button></div><div className="category-manager-list">{categories.map((category) => <div className={`category-manager-row tone-${category.tone}`} key={category.id}><span className="tone-dot" /><input value={category.label} onChange={(event) => updateCategory({ ...category, label: event.target.value })} /><select value={category.tone} onChange={(event) => updateCategory({ ...category, tone: event.target.value })}>{TONES.map((item) => <option key={item} value={item}>{item}</option>)}</select><button className="icon-button" disabled={category.locked} onClick={() => deleteCategory(category.id)} aria-label={`Delete ${category.label}`}><Trash2 size={16} /></button></div>)}</div><form className="new-category" onSubmit={add}><label>New category<input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Category name" /></label><label>Colour<select value={tone} onChange={(event) => setTone(event.target.value)}>{TONES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><button className="primary-action">Add category</button></form><p className="sheet-note">Built-in categories cannot be deleted because approved tasks depend on them. Their names and colours can still be changed.</p></ModalFrame>;
}

function AdviceDetail({ item, onClose }) {
  if (!item) return null;
  return <ModalFrame onClose={onClose}><div className="sheet-header"><div><p className="eyebrow">{item.type}</p><h2>{item.title}</h2></div><button className="icon-button" onClick={onClose}><X /></button></div><p className="advice-lead">{item.summary}</p><ol className="advice-steps">{item.body.map((paragraph) => <li key={paragraph}>{paragraph}</li>)}</ol></ModalFrame>;
}

function ConditionChooser({ open, onClose }) {
  const tasks = useAppStore((state) => state.tasks);
  const setActiveTask = useAppStore((state) => state.setActiveTask);
  if (!open) return null;
  const choose = (condition) => { if (tasks.some((task) => task.id === condition.taskId)) setActiveTask(condition.taskId); onClose(); };
  return <ModalFrame onClose={onClose}><div className="sheet-header"><div><p className="eyebrow">What needs attention?</p><h2>Choose the sentence that is true now.</h2></div><button className="icon-button" onClick={onClose}><X /></button></div><div className="condition-list">{ROOM_CONDITIONS.map((condition) => <button className={`condition-button tone-${condition.tone}`} key={condition.id} onClick={() => choose(condition)}><span className="tone-dot" /><span>{condition.label}</span><ChevronRight size={18} /></button>)}</div></ModalFrame>;
}

function WardrobeEditor({ item, open, onClose }) {
  const addItem = useAppStore((state) => state.addWardrobeItem);
  const updateItem = useAppStore((state) => state.updateWardrobeItem);
  const deleteItem = useAppStore((state) => state.deleteWardrobeItem);
  const [draft, setDraft] = useState(item || { name: '', kind: '', location: '', status: 'current', notes: '', photo: '' });
  useEffect(() => { if (open) setDraft(item || { name: '', kind: '', location: '', status: 'current', notes: '', photo: '' }); }, [item, open]);
  if (!open) return null;
  const readPhoto = (event) => { const file = event.target.files?.[0]; if (!file) return; if (file.size > 2_000_000) return window.alert('Choose an image smaller than 2 MB so browser storage does not fill up.'); const reader = new FileReader(); reader.onload = () => setDraft((value) => ({ ...value, photo: String(reader.result) })); reader.readAsDataURL(file); };
  const save = (event) => { event.preventDefault(); if (!draft.name.trim()) return; item ? updateItem({ ...draft, name: draft.name.trim() }) : addItem({ ...draft, name: draft.name.trim() }); onClose(); };
  const remove = () => { if (item && window.confirm(`Delete “${item.name}” from Wardrobe?`)) { deleteItem(item.id); onClose(); } };
  return <div className="modal-backdrop" onMouseDown={onClose}><form className="sheet" onSubmit={save} onMouseDown={(event) => event.stopPropagation()}><div className="sheet-handle" /><div className="sheet-header"><div><p className="eyebrow">Wardrobe item</p><h2>{item ? 'Update clothing record' : 'Add clothing record'}</h2></div><button type="button" className="icon-button" onClick={onClose}><X /></button></div><label className="photo-field">Photo{draft.photo ? <img src={draft.photo} alt="Preview" /> : <span><ImagePlus size={28} /> Add an optional photo</span>}<input type="file" accept="image/*" onChange={readPhoto} /></label><label>Item name<input autoFocus value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="For example: black hoodie" /></label><label>Type<input value={draft.kind} onChange={(event) => setDraft({ ...draft, kind: event.target.value })} placeholder="Top, trousers, shoes…" /></label><label>Location<input value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} placeholder="Drawer, rail, labelled box…" /></label><fieldset><legend>Wardrobe group</legend><div className="segmented"><button type="button" className={draft.status === 'current' ? 'active' : ''} onClick={() => setDraft({ ...draft, status: 'current' })}>Current</button><button type="button" className={draft.status === 'reserve' ? 'active' : ''} onClick={() => setDraft({ ...draft, status: 'reserve' })}>Reserve</button></div></fieldset><label>Notes<textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} /></label><div className="sheet-footer"><button className="primary-action">Save item</button>{item && <button type="button" className="danger-action" onClick={remove}><Trash2 size={17} /> Delete item</button>}</div></form></div>;
}

const INDEX_GROUPS = [
  { title: 'Do something now', items: [
    { label: 'Find my current cleaning task', action: 'today' },
    { label: 'Tell the app what needs attention', action: 'condition' },
    { label: 'Continue an unfinished task', action: 'active' },
    { label: 'Start the room-reset task list', action: 'tasks' },
  ] },
  { title: 'Create or change', items: [
    { label: 'Add a one-off task', action: 'capture-oneoff' },
    { label: 'Add a permanent task', action: 'capture-permanent' },
    { label: 'Edit a task and its instructions', action: 'tasks' },
    { label: 'Manage task categories and colours', action: 'categories' },
    { label: 'Add clothing to Wardrobe', action: 'wardrobe-add' },
  ] },
  { title: 'Find help or data', items: [
    { label: 'Find book guidance or one of my rules', action: 'advice' },
    { label: 'Find where clothing is stored', action: 'wardrobe' },
    { label: 'Change appearance or check connections', action: 'settings' },
    { label: 'Export or restore a backup', action: 'more' },
  ] },
];

function IndexDialog({ open, onClose, onAction }) {
  const [query, setQuery] = useState('');
  if (!open) return null;
  const groups = INDEX_GROUPS.map((group) => ({ ...group, items: group.items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())) })).filter((group) => group.items.length);
  return <div className="modal-backdrop index-backdrop" onMouseDown={onClose}><section className="index-dialog" onMouseDown={(event) => event.stopPropagation()}><div className="sheet-header"><div><p className="eyebrow">Index / I’m lost</p><h2>What are you trying to do?</h2></div><button className="icon-button" onClick={onClose}><X /></button></div><label className="search-box"><Search size={19} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Add a task, find advice, restore backup…" /></label><div className="index-groups">{groups.map((group) => <section key={group.title} className="index-group"><h3>{group.title}</h3>{group.items.map((item) => <button key={item.label} onClick={() => { onAction(item.action); onClose(); }}><span>{item.label}</span><ChevronRight size={18} /></button>)}</section>)}{groups.length === 0 && <p className="empty-copy">No exact match. Try a shorter word such as “task”, “clothes”, “advice” or “backup”.</p>}</div></section></div>;
}

export default function App() {
  const view = useAppStore((state) => state.view);
  const setView = useAppStore((state) => state.setView);
  const session = useAppStore((state) => state.session);
  const appearance = useAppStore((state) => state.appearance);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [captureType, setCaptureType] = useState('oneoff');
  const [indexOpen, setIndexOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [adviceItem, setAdviceItem] = useState(null);
  const [conditionOpen, setConditionOpen] = useState(false);
  const [wardrobeEditorOpen, setWardrobeEditorOpen] = useState(false);
  const [wardrobeItem, setWardrobeItem] = useState(null);

  useEffect(() => { document.documentElement.dataset.theme = appearance; }, [appearance]);
  const visibleView = session && view === 'active' ? 'active' : view;
  const openCapture = (type = 'oneoff') => { setCaptureType(type); setCaptureOpen(true); };
  const openWardrobeEditor = (item = null) => { setWardrobeItem(item); setWardrobeEditorOpen(true); };
  const navigate = (destination) => { setView(destination); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleIndexAction = (action) => {
    if (action === 'capture-oneoff') return openCapture('oneoff');
    if (action === 'capture-permanent') return openCapture('permanent');
    if (action === 'categories') return setCategoriesOpen(true);
    if (action === 'condition') return setConditionOpen(true);
    if (action === 'wardrobe-add') { navigate('wardrobe'); return openWardrobeEditor(); }
    if (action === 'active' && !session) return navigate('today');
    navigate(action);
  };

  return (
    <div className="app-frame">
      <AppHeader onOpenIndex={() => setIndexOpen(true)} onOpenCapture={() => openCapture('oneoff')} />
      <Navigation view={visibleView === 'active' || ['wardrobe', 'settings'].includes(visibleView) ? (visibleView === 'active' ? 'today' : 'more') : visibleView} onChange={navigate} />
      <main className="content-area">
        {visibleView === 'today' && <TodayScreen onOpenIndex={() => setIndexOpen(true)} onOpenCapture={() => openCapture('oneoff')} onChooseCondition={() => setConditionOpen(true)} />}
        {visibleView === 'active' && <ActiveTaskScreen />}
        {visibleView === 'tasks' && <TasksScreen onEdit={setEditingTask} onOpenCapture={() => openCapture('oneoff')} onManageCategories={() => setCategoriesOpen(true)} />}
        {visibleView === 'advice' && <AdviceScreen onOpenAdvice={setAdviceItem} />}
        {visibleView === 'more' && <MoreScreen onOpenIndex={() => setIndexOpen(true)} onWardrobe={() => navigate('wardrobe')} onSettings={() => navigate('settings')} />}
        {visibleView === 'wardrobe' && <WardrobeScreen onAdd={() => openWardrobeEditor()} onEdit={openWardrobeEditor} />}
        {visibleView === 'settings' && <SettingsScreen />}
      </main>
      <QuickCapture open={captureOpen} initialType={captureType} onClose={() => setCaptureOpen(false)} />
      <TaskEditor task={editingTask} onClose={() => setEditingTask(null)} />
      <CategoryManager open={categoriesOpen} onClose={() => setCategoriesOpen(false)} />
      <AdviceDetail item={adviceItem} onClose={() => setAdviceItem(null)} />
      <ConditionChooser open={conditionOpen} onClose={() => setConditionOpen(false)} />
      <WardrobeEditor item={wardrobeItem} open={wardrobeEditorOpen} onClose={() => { setWardrobeEditorOpen(false); setWardrobeItem(null); }} />
      <IndexDialog open={indexOpen} onClose={() => setIndexOpen(false)} onAction={handleIndexAction} />
    </div>
  );
}
