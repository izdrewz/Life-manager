import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { create } from 'zustand';
import {
  Archive,
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Download,
  Home,
  Layers3,
  ListTodo,
  Menu,
  MoreHorizontal,
  PackageOpen,
  Pencil,
  Play,
  Plus,
  Search,
  Settings,
  Shirt,
  Sparkles,
  Trash2,
  Utensils,
  X,
} from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'life-manager-react-rebuild-v1';

const CATEGORY_META = {
  food: { label: 'Food & dishes', icon: Utensils, tone: 'blue' },
  waste: { label: 'Rubbish & recycling', icon: Trash2, tone: 'berry' },
  clothes: { label: 'Clothes & laundry', icon: Shirt, tone: 'mauve' },
  function: { label: 'Bed & route', icon: Home, tone: 'gold' },
  tidying: { label: 'Surfaces & tidying', icon: Layers3, tone: 'lavender' },
  organise: { label: 'Organisation & storage', icon: Archive, tone: 'slate' },
  oneoff: { label: 'One-off', icon: Sparkles, tone: 'ochre' },
};

const DEFAULT_TASKS = [
  {
    id: 'take-dishes',
    title: 'Take dishes to the kitchen',
    category: 'food',
    type: 'permanent',
    mode: 'recovery',
    minimumLabel: 'Take one load',
    fullLabel: 'Remove every dish',
    minimum: 'One safe load reaches the kitchen hand-off point.',
    full: 'Repeat the carrier cycle until all bedroom dishes are removed.',
    loop: 'dishes',
    steps: [
      'Get the dish transport carrier and begin filling it.',
      'Take the load to the agreed kitchen hand-off point.',
      'Are all bedroom dishes removed?',
    ],
  },
  {
    id: 'bag-visible-mess',
    title: 'Bag one visible zone',
    category: 'tidying',
    type: 'permanent',
    mode: 'recovery',
    minimumLabel: 'Do one bag',
    fullLabel: 'Finish this zone',
    minimum: 'Close one filled bag or dedicated container.',
    full: 'Contain the chosen zone without opening another sorting project.',
    steps: [
      'Choose one small visible floor or surface zone and open one bag.',
      'Put loose mixed items into the bag. Route obvious dishes, cans, cardboard and dirty clothes into their dedicated containers.',
      'Close the bag or finish the chosen container before opening another.',
    ],
  },
  {
    id: 'process-one-bag',
    title: 'Process one mixed bag',
    category: 'organise',
    type: 'permanent',
    mode: 'recovery',
    minimumLabel: 'Process one bag',
    fullLabel: 'Finish this bag',
    minimum: 'Process one bag. Stopping after it counts.',
    full: 'Route everything in the bag into rubbish, dishes, clothing, homes or the no-home container.',
    steps: [
      'Open one bag only and remove rubbish.',
      'Move dishes to the carrier and clothing to the correct clothing container.',
      'Return items with homes. Put items without homes into the single no-home container.',
      'Close or remove this bag before opening another.',
    ],
  },
  {
    id: 'remove-rubbish',
    title: 'Remove the bedroom rubbish bag',
    category: 'waste',
    type: 'permanent',
    mode: 'maintenance',
    minimumLabel: 'Remove one bag',
    fullLabel: 'Replace the bag too',
    minimum: 'Remove one closed bag.',
    full: 'Remove the full bag and put a replacement in place.',
    steps: [
      'Close the current rubbish bag.',
      'Take it to the household rubbish point.',
      'Put a replacement bag or container in place.',
    ],
  },
  {
    id: 'dirty-clothes',
    title: 'Put dirty clothing into the basket',
    category: 'clothes',
    type: 'permanent',
    mode: 'maintenance',
    minimumLabel: 'Move one item',
    fullLabel: 'Clear this zone',
    minimum: 'Put one dirty item into the basket.',
    full: 'Collect all dirty clothing in the selected zone.',
    steps: [
      'Put the nearest dirty item into the laundry basket.',
      'Collect only dirty clothing in the selected zone.',
      'Leave clean clothing for a separate put-away task.',
    ],
  },
  {
    id: 'restore-bed',
    title: 'Make the bed usable',
    category: 'function',
    type: 'permanent',
    mode: 'recovery',
    minimumLabel: 'Make enough space',
    fullLabel: 'Clear the bed',
    minimum: 'Clear enough space to use the bed.',
    full: 'Route all blocking items until the bed is fully usable.',
    steps: [
      'Move one item that prevents the bed being used.',
      'Continue only with items blocking the bed.',
      'Stop when the bed can be used.',
    ],
  },
  {
    id: 'walking-route',
    title: 'Clear the walking route',
    category: 'function',
    type: 'permanent',
    mode: 'recovery',
    minimumLabel: 'Clear one step',
    fullLabel: 'Clear the route',
    minimum: 'Clear one additional step of the route.',
    full: 'Create one continuous clear route through the bedroom.',
    steps: [
      'Move the nearest obstruction into its correct container or home.',
      'Continue only along the main route.',
      'Stop when the route is continuous and usable.',
    ],
  },
  {
    id: 'wet-carpet',
    title: 'Deal with the wet carpet around the dehumidifier',
    category: 'oneoff',
    type: 'oneoff',
    mode: 'recovery',
    minimumLabel: 'Record the next action',
    fullLabel: 'Resolve the issue',
    minimum: 'Keep the area excluded and record the next action.',
    full: 'Resolve the temporary wet-carpet task and close it.',
    steps: [
      'Keep the wet patch excluded from ordinary floor tasks.',
      'Follow the separate wet-carpet plan.',
      'Close this one-off task when the temporary issue is resolved.',
    ],
  },
];

const DEFAULT_ADVICE = [
  {
    id: 'five-things',
    title: 'Five Things method',
    type: 'Book guidance',
    summary: 'Sort visible mess into rubbish, dishes, clothing, items with homes and items without homes.',
  },
  {
    id: 'one-bag',
    title: 'One bag only',
    type: 'My method',
    summary: 'Open one bag, finish what is possible, then close or remove it before opening another.',
  },
  {
    id: 'minimum-counts',
    title: 'Minimum counts',
    type: 'My rule',
    summary: 'The smaller version is a valid completion, not a failed full version.',
  },
];

const safeLoad = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const saved = safeLoad();

const useAppStore = create((set, get) => ({
  view: 'today',
  tasks: Array.isArray(saved.tasks) && saved.tasks.length ? saved.tasks : DEFAULT_TASKS,
  history: Array.isArray(saved.history) ? saved.history : [],
  activeTaskId: saved.activeTaskId || 'take-dishes',
  session: saved.session || null,
  setView: (view) => set({ view }),
  setActiveTask: (activeTaskId) => set({ activeTaskId, view: 'today' }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (task) => set((state) => ({ tasks: state.tasks.map((item) => item.id === task.id ? task : item) })),
  startTask: (taskId, version) => set({
    session: { taskId, version, stepIndex: 0, cycles: 0, minimumDecision: false },
    activeTaskId: taskId,
    view: 'active',
  }),
  nextStep: () => set((state) => {
    if (!state.session) return state;
    const task = state.tasks.find((item) => item.id === state.session.taskId);
    if (!task) return { session: null, view: 'today' };
    const nextIndex = state.session.stepIndex + 1;
    if (nextIndex >= task.steps.length) return state;
    return { session: { ...state.session, stepIndex: nextIndex } };
  }),
  previousStep: () => set((state) => state.session ? {
    session: { ...state.session, stepIndex: Math.max(0, state.session.stepIndex - 1), minimumDecision: false },
  } : state),
  answerDishQuestion: (allRemoved) => {
    const state = get();
    if (!state.session) return;
    if (allRemoved) {
      get().completeSession('All bedroom dishes removed');
      return;
    }
    if (state.session.version === 'minimum') {
      set({ session: { ...state.session, minimumDecision: true } });
      return;
    }
    set({ session: { ...state.session, stepIndex: 0, cycles: state.session.cycles + 1 } });
  },
  continueDishLoop: () => set((state) => state.session ? {
    session: { ...state.session, stepIndex: 0, cycles: state.session.cycles + 1, minimumDecision: false },
  } : state),
  completeSession: (result = 'Completed') => set((state) => {
    if (!state.session) return state;
    const task = state.tasks.find((item) => item.id === state.session.taskId);
    const record = {
      id: `${Date.now()}`,
      taskId: state.session.taskId,
      title: task?.title || 'Task',
      version: state.session.version,
      result,
      completedAt: new Date().toISOString(),
    };
    return { history: [record, ...state.history], session: null, view: 'today' };
  }),
  stopSession: () => set({ session: null, view: 'today' }),
  importState: (payload) => set({
    tasks: Array.isArray(payload.tasks) ? payload.tasks : get().tasks,
    history: Array.isArray(payload.history) ? payload.history : get().history,
    activeTaskId: payload.activeTaskId || get().activeTaskId,
    session: payload.session || null,
  }),
}));

useAppStore.subscribe((state) => {
  const payload = {
    tasks: state.tasks,
    history: state.history,
    activeTaskId: state.activeTaskId,
    session: state.session,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Local storage is a convenience, not a requirement for rendering.
  }
});

const navItems = [
  { id: 'today', label: 'Today', icon: Home },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'advice', label: 'Advice', icon: BookOpen },
  { id: 'more', label: 'More', icon: MoreHorizontal },
];

function CategoryBadge({ category }) {
  const meta = CATEGORY_META[category] || CATEGORY_META.organise;
  const Icon = meta.icon;
  return (
    <span className={`category-badge tone-${meta.tone}`}>
      <Icon size={15} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

function AppHeader({ onOpenIndex, onOpenCapture }) {
  return (
    <header className="app-header">
      <div className="brand-block">
        <span className="brand-mark" aria-hidden="true"><Sparkles size={19} /></span>
        <div>
          <p>Life Manager</p>
          <span>one useful action at a time</span>
        </div>
      </div>
      <div className="header-actions">
        <button className="icon-text-button" onClick={onOpenCapture}>
          <Plus size={18} />
          <span>Quick add</span>
        </button>
        <button className="icon-button" onClick={onOpenIndex} aria-label="Open Index or I’m lost">
          <CircleHelp size={20} />
        </button>
      </div>
    </header>
  );
}

function Navigation({ view, onChange }) {
  return (
    <nav className="primary-nav" aria-label="Primary navigation">
      {navItems.map(({ id, label, icon: Icon }) => (
        <button key={id} className={view === id ? 'active' : ''} onClick={() => onChange(id)}>
          <Icon size={21} aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function FocusCard({ task, onStart }) {
  const meta = CATEGORY_META[task.category] || CATEGORY_META.organise;
  const Icon = meta.icon;
  return (
    <article className={`focus-card tone-${meta.tone}`}>
      <div className="focus-visual" aria-hidden="true">
        <Icon size={32} strokeWidth={2.2} />
      </div>
      <div className="focus-copy">
        <CategoryBadge category={task.category} />
        <p className="overline">Current task</p>
        <h2>{task.title}</h2>
        <p className="start-line"><strong>Start:</strong> {task.steps[0]}</p>
      </div>
      <div className="focus-actions">
        <button className="primary-action" onClick={() => onStart(task.id, 'minimum')}>
          <Play size={19} fill="currentColor" />
          {task.minimumLabel}
        </button>
        <button className="secondary-action" onClick={() => onStart(task.id, 'full')}>
          {task.fullLabel}
          <ChevronRight size={18} />
        </button>
      </div>
      <p className="counts-note">The smaller version counts as complete.</p>
    </article>
  );
}

function TodayScreen({ onOpenIndex, onOpenCapture }) {
  const tasks = useAppStore((state) => state.tasks);
  const activeTaskId = useAppStore((state) => state.activeTaskId);
  const startTask = useAppStore((state) => state.startTask);
  const setView = useAppStore((state) => state.setView);
  const task = tasks.find((item) => item.id === activeTaskId) || tasks[0];

  return (
    <section className="screen today-screen">
      <div className="welcome-row">
        <div>
          <p className="eyebrow">Hello, Izzy</p>
          <h1>Pick one useful thing.</h1>
        </div>
        <button className="mobile-menu-button" onClick={onOpenIndex}><Menu size={21} /> Find anything</button>
      </div>

      <div className="today-layout">
        <FocusCard task={task} onStart={startTask} />

        <aside className="support-column" aria-label="Other routes">
          <section className="support-card warm">
            <div className="support-heading">
              <span className="mini-icon"><Sparkles size={18} /></span>
              <div>
                <p className="overline">Room state</p>
                <h3>Room reset is active</h3>
              </div>
            </div>
            <p>The ordered reset plan stays available without filling this screen.</p>
            <button onClick={() => setView('tasks')}>See reset tasks <ChevronRight size={17} /></button>
          </section>

          <div className="route-grid">
            <button className="route-card coral" onClick={() => setView('tasks')}>
              <ClipboardList size={22} />
              <span><strong>What needs attention?</strong><small>Choose a current room condition</small></span>
              <ChevronRight size={18} />
            </button>
            <button className="route-card sage" onClick={onOpenCapture}>
              <Plus size={22} />
              <span><strong>Add something quickly</strong><small>Save it first; details can wait</small></span>
              <ChevronRight size={18} />
            </button>
            <button className="route-card blue" onClick={onOpenIndex}>
              <CircleHelp size={22} />
              <span><strong>I’m lost</strong><small>Find a page, action or prompt</small></span>
              <ChevronRight size={18} />
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ActiveTaskScreen() {
  const tasks = useAppStore((state) => state.tasks);
  const session = useAppStore((state) => state.session);
  const nextStep = useAppStore((state) => state.nextStep);
  const previousStep = useAppStore((state) => state.previousStep);
  const stopSession = useAppStore((state) => state.stopSession);
  const completeSession = useAppStore((state) => state.completeSession);
  const answerDishQuestion = useAppStore((state) => state.answerDishQuestion);
  const continueDishLoop = useAppStore((state) => state.continueDishLoop);
  const task = tasks.find((item) => item.id === session?.taskId);

  if (!task || !session) return null;

  const isDishQuestion = task.loop === 'dishes' && session.stepIndex === 2;
  const isFinalOrdinaryStep = task.loop !== 'dishes' && session.stepIndex === task.steps.length - 1;
  const currentStep = task.steps[session.stepIndex];

  return (
    <section className="screen active-screen">
      <button className="back-link" onClick={stopSession}><ArrowLeft size={18} /> Save and leave</button>
      <div className={`active-task-shell tone-${CATEGORY_META[task.category]?.tone || 'slate'}`}>
        <div className="active-task-topline">
          <CategoryBadge category={task.category} />
          <span>{session.version === 'minimum' ? 'Smaller version' : 'Full version'}</span>
        </div>
        <p className="overline">{task.title}</p>
        <div className="step-counter">Step {session.stepIndex + 1} of {task.steps.length}</div>
        <h1>{currentStep}</h1>

        {session.minimumDecision ? (
          <div className="decision-panel">
            <p>One load is done. Stopping here counts.</p>
            <button className="primary-action" onClick={() => completeSession('One safe load taken to the kitchen')}>Stop — one load counts</button>
            <button className="secondary-action" onClick={continueDishLoop}>Do another load</button>
          </div>
        ) : isDishQuestion ? (
          <div className="answer-grid">
            <button className="primary-action" onClick={() => answerDishQuestion(true)}><Check size={20} /> Yes — complete task</button>
            <button className="secondary-action" onClick={() => answerDishQuestion(false)}>No — {session.version === 'full' ? 'repeat the carrier cycle' : 'choose whether to stop'}</button>
          </div>
        ) : (
          <div className="active-actions">
            {session.stepIndex > 0 && <button className="text-action" onClick={previousStep}>Back</button>}
            {isFinalOrdinaryStep ? (
              <button className="primary-action" onClick={() => completeSession()}>Done <Check size={20} /></button>
            ) : (
              <button className="primary-action" onClick={nextStep}>Done — next step <ChevronRight size={20} /></button>
            )}
          </div>
        )}
      </div>
      <p className="active-help">Only the current instruction is shown. The rest stays out of sight until needed.</p>
    </section>
  );
}

function TasksScreen({ onEdit }) {
  const tasks = useAppStore((state) => state.tasks);
  const startTask = useAppStore((state) => state.startTask);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const filtered = useMemo(() => tasks.filter((task) => {
    const matchesQuery = task.title.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'all' || task.type === filter || task.mode === filter;
    return matchesQuery && matchesFilter;
  }), [tasks, query, filter]);

  return (
    <section className="screen list-screen">
      <div className="page-heading">
        <div><p className="eyebrow">Task library</p><h1>Choose, add or change a task.</h1></div>
      </div>
      <label className="search-box">
        <Search size={19} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks" />
      </label>
      <div className="filter-row" aria-label="Task filters">
        {[
          ['all', 'All'],
          ['recovery', 'Room reset'],
          ['maintenance', 'Maintenance'],
          ['oneoff', 'One-off'],
        ].map(([id, label]) => <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>)}
      </div>
      <div className="task-list">
        {filtered.map((task) => {
          const meta = CATEGORY_META[task.category] || CATEGORY_META.organise;
          const Icon = meta.icon;
          return (
            <article key={task.id} className={`task-row tone-${meta.tone}`}>
              <span className="task-row-icon"><Icon size={21} /></span>
              <div className="task-row-copy">
                <CategoryBadge category={task.category} />
                <h2>{task.title}</h2>
                <p>{task.minimum}</p>
              </div>
              <div className="task-row-actions">
                <button className="small-primary" onClick={() => startTask(task.id, 'minimum')}><Play size={16} /> Start</button>
                <button className="small-secondary" onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`}><Pencil size={17} /></button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AdviceScreen() {
  return (
    <section className="screen list-screen">
      <div className="page-heading"><div><p className="eyebrow">Advice</p><h1>Find the method when you need it.</h1></div></div>
      <div className="advice-grid">
        {DEFAULT_ADVICE.map((item) => (
          <article className="advice-card" key={item.id}>
            <span>{item.type}</span>
            <h2>{item.title}</h2>
            <p>{item.summary}</p>
            <button>Open advice <ChevronRight size={17} /></button>
          </article>
        ))}
      </div>
    </section>
  );
}

function MoreScreen({ onOpenIndex }) {
  const history = useAppStore((state) => state.history);
  const tasks = useAppStore((state) => state.tasks);
  const activeTaskId = useAppStore((state) => state.activeTaskId);
  const session = useAppStore((state) => state.session);
  const fileInputRef = useRef(null);
  const importState = useAppStore((state) => state.importState);

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify({ tasks, history, activeTaskId, session }, null, 2)], { type: 'application/json' });
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
    try {
      const payload = JSON.parse(await file.text());
      importState(payload);
    } catch {
      alert('That backup file could not be read.');
    }
    event.target.value = '';
  };

  return (
    <section className="screen list-screen">
      <div className="page-heading"><div><p className="eyebrow">More</p><h1>Useful tools that do not belong on Today.</h1></div></div>
      <div className="more-grid">
        <button className="more-card" onClick={onOpenIndex}><CircleHelp /><span><strong>Index / I’m lost</strong><small>Find any action in ordinary wording</small></span><ChevronRight /></button>
        <button className="more-card"><PackageOpen /><span><strong>Wardrobe</strong><small>Clothing photos, locations and reserve</small></span><ChevronRight /></button>
        <button className="more-card"><Settings /><span><strong>Settings & connections</strong><small>Appearance, Calendar, Esslay and backups</small></span><ChevronRight /></button>
        <button className="more-card" onClick={exportBackup}><Download /><span><strong>Export backup</strong><small>Save a copy of your local data</small></span><ChevronRight /></button>
        <button className="more-card" onClick={() => fileInputRef.current?.click()}><Archive /><span><strong>Import backup</strong><small>Restore a previous Life Manager file</small></span><ChevronRight /></button>
        <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={importBackup} />
      </div>
      <section className="history-section">
        <h2>Recent completions</h2>
        {history.length === 0 ? <p className="empty-copy">Nothing completed in this rebuild yet.</p> : history.slice(0, 8).map((record) => (
          <div className="history-row" key={record.id}>
            <span className="history-check"><Check size={16} /></span>
            <div><strong>{record.title}</strong><small>{record.result} · {new Date(record.completedAt).toLocaleString('en-GB')}</small></div>
          </div>
        ))}
      </section>
    </section>
  );
}

function QuickCapture({ open, onClose }) {
  const addTask = useAppStore((state) => state.addTask);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('oneoff');
  const [category, setCategory] = useState('tidying');

  useEffect(() => {
    if (!open) setTitle('');
  }, [open]);

  if (!open) return null;

  const save = (event) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    addTask({
      id: `personal-${Date.now()}`,
      title: trimmed,
      category,
      type,
      mode: type === 'oneoff' ? 'recovery' : 'maintenance',
      minimumLabel: 'Do the small version',
      fullLabel: 'Do the full version',
      minimum: 'Complete one useful part.',
      full: 'Complete the task as currently defined.',
      steps: [trimmed],
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="sheet" onSubmit={save} onMouseDown={(event) => event.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header"><div><p className="eyebrow">Quick capture</p><h2>Save it before it disappears.</h2></div><button type="button" className="icon-button" onClick={onClose}><X /></button></div>
        <label>What do you need to remember?<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="For example: clear the chair" /></label>
        <fieldset><legend>What kind?</legend><div className="segmented"><button type="button" className={type === 'oneoff' ? 'active' : ''} onClick={() => setType('oneoff')}>One-off</button><button type="button" className={type === 'permanent' ? 'active' : ''} onClick={() => setType('permanent')}>Permanent</button></div></fieldset>
        <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}>{Object.entries(CATEGORY_META).map(([id, meta]) => <option key={id} value={id}>{meta.label}</option>)}</select></label>
        <p className="sheet-note">Only the name, type and category are required now. Steps can be edited later.</p>
        <button className="primary-action" type="submit">Save task</button>
      </form>
    </div>
  );
}

function TaskEditor({ task, onClose }) {
  const updateTask = useAppStore((state) => state.updateTask);
  const [draft, setDraft] = useState(task);
  if (!task) return null;

  const save = (event) => {
    event.preventDefault();
    updateTask({ ...draft, title: draft.title.trim() || task.title });
    onClose();
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="sheet wide-sheet" onSubmit={save} onMouseDown={(event) => event.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header"><div><p className="eyebrow">Edit task</p><h2>{task.title}</h2></div><button type="button" className="icon-button" onClick={onClose}><X /></button></div>
        <label>Task name<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
        <label>Category<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>{Object.entries(CATEGORY_META).map(([id, meta]) => <option key={id} value={id}>{meta.label}</option>)}</select></label>
        <label>Smaller version<textarea value={draft.minimum} onChange={(event) => setDraft({ ...draft, minimum: event.target.value })} /></label>
        <label>Full version<textarea value={draft.full} onChange={(event) => setDraft({ ...draft, full: event.target.value })} /></label>
        <button className="primary-action" type="submit">Save changes</button>
      </form>
    </div>
  );
}

const INDEX_GROUPS = [
  {
    title: 'Do something now',
    items: [
      ['Find my current task', 'today'],
      ['Choose another cleaning task', 'tasks'],
      ['Continue an unfinished task', 'active'],
    ],
  },
  {
    title: 'Create or change',
    items: [
      ['Add a one-off task', 'capture'],
      ['Add a permanent task', 'capture'],
      ['Edit an existing task', 'tasks'],
      ['Manage task categories', 'tasks'],
    ],
  },
  {
    title: 'Find help',
    items: [
      ['Find book guidance', 'advice'],
      ['Find one of my rules', 'advice'],
      ['Export or restore a backup', 'more'],
    ],
  },
];

function IndexDialog({ open, onClose, onNavigate, onCapture }) {
  const [query, setQuery] = useState('');
  const session = useAppStore((state) => state.session);
  if (!open) return null;

  const choose = (destination) => {
    if (destination === 'capture') onCapture();
    else if (destination === 'active' && !session) onNavigate('today');
    else onNavigate(destination);
    onClose();
  };

  const groups = INDEX_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(([label]) => label.toLowerCase().includes(query.toLowerCase())),
  })).filter((group) => group.items.length);

  return (
    <div className="modal-backdrop index-backdrop" onMouseDown={onClose}>
      <section className="index-dialog" onMouseDown={(event) => event.stopPropagation()}>
        <div className="sheet-header"><div><p className="eyebrow">Index / I’m lost</p><h2>What are you trying to do?</h2></div><button className="icon-button" onClick={onClose}><X /></button></div>
        <label className="search-box"><Search size={19} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Add a task, find advice, restore backup…" /></label>
        <div className="index-groups">
          {groups.map((group) => (
            <section key={group.title} className="index-group">
              <h3>{group.title}</h3>
              {group.items.map(([label, destination]) => <button key={label} onClick={() => choose(destination)}><span>{label}</span><ChevronRight size={18} /></button>)}
            </section>
          ))}
          {groups.length === 0 && <p className="empty-copy">No exact match. Try a shorter word such as “task”, “advice” or “backup”.</p>}
        </div>
      </section>
    </div>
  );
}

function App() {
  const view = useAppStore((state) => state.view);
  const setView = useAppStore((state) => state.setView);
  const session = useAppStore((state) => state.session);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const visibleView = session && view === 'active' ? 'active' : view;

  return (
    <div className="app-frame">
      <AppHeader onOpenIndex={() => setIndexOpen(true)} onOpenCapture={() => setCaptureOpen(true)} />
      <Navigation view={visibleView === 'active' ? 'today' : visibleView} onChange={setView} />
      <main className="content-area">
        {visibleView === 'today' && <TodayScreen onOpenIndex={() => setIndexOpen(true)} onOpenCapture={() => setCaptureOpen(true)} />}
        {visibleView === 'active' && <ActiveTaskScreen />}
        {visibleView === 'tasks' && <TasksScreen onEdit={setEditingTask} />}
        {visibleView === 'advice' && <AdviceScreen />}
        {visibleView === 'more' && <MoreScreen onOpenIndex={() => setIndexOpen(true)} />}
      </main>
      <QuickCapture open={captureOpen} onClose={() => setCaptureOpen(false)} />
      <TaskEditor task={editingTask} onClose={() => setEditingTask(null)} />
      <IndexDialog open={indexOpen} onClose={() => setIndexOpen(false)} onNavigate={setView} onCapture={() => setCaptureOpen(true)} />
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
