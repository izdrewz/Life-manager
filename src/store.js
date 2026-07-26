import { create } from 'zustand';
import { DEFAULT_CATEGORIES, DEFAULT_TASKS } from './data.js';

const STORAGE_KEY = 'life-manager-react-rebuild-v2';
const PREVIOUS_KEYS = ['life-manager-react-rebuild-v1', 'life-manager-cleaning-v1'];

const clone = (value) => JSON.parse(JSON.stringify(value));

function readJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const value = JSON.parse(raw);
    return value && typeof value === 'object' ? value : null;
  } catch {
    return null;
  }
}

function normaliseTask(task, index = 0) {
  const title = String(task?.title || `Untitled task ${index + 1}`).trim();
  const steps = Array.isArray(task?.steps) && task.steps.length
    ? task.steps.map((step) => String(step).trim()).filter(Boolean)
    : [String(task?.firstStep || title).trim()];
  return {
    id: String(task?.id || `migrated-${Date.now()}-${index}`),
    title,
    category: String(task?.category || 'tidying'),
    type: task?.type === 'oneoff' ? 'oneoff' : 'permanent',
    mode: task?.mode === 'maintenance' ? 'maintenance' : 'recovery',
    minimumLabel: String(task?.minimumLabel || 'Do the smaller version'),
    fullLabel: String(task?.fullLabel || 'Do the full version'),
    minimum: String(task?.minimum || 'Complete one useful part.'),
    full: String(task?.full || 'Complete the task as currently defined.'),
    preserve: Boolean(task?.preserve),
    loop: task?.loop || false,
    steps,
    createdByUser: Boolean(task?.createdByUser || String(task?.id || '').startsWith('personal-')),
  };
}

function migrateState() {
  const current = readJSON(STORAGE_KEY);
  if (current) return current;

  for (const key of PREVIOUS_KEYS) {
    const old = readJSON(key);
    if (!old) continue;
    return {
      tasks: Array.isArray(old.tasks) ? old.tasks.map(normaliseTask) : clone(DEFAULT_TASKS),
      categories: clone(DEFAULT_CATEGORIES),
      history: Array.isArray(old.history) ? old.history : [],
      activeTaskId: old.activeTaskId || 'take-dishes',
      session: old.session || null,
      wardrobe: Array.isArray(old.wardrobe) ? old.wardrobe : [],
      appearance: old.appearance || 'system',
      migratedFrom: key,
    };
  }

  return {};
}

const saved = typeof window === 'undefined' ? {} : migrateState();
const initialTasks = Array.isArray(saved.tasks) && saved.tasks.length ? saved.tasks.map(normaliseTask) : clone(DEFAULT_TASKS);
const initialCategories = Array.isArray(saved.categories) && saved.categories.length ? saved.categories : clone(DEFAULT_CATEGORIES);

export const useAppStore = create((set, get) => ({
  view: 'today',
  tasks: initialTasks,
  categories: initialCategories,
  history: Array.isArray(saved.history) ? saved.history : [],
  wardrobe: Array.isArray(saved.wardrobe) ? saved.wardrobe : [],
  activeTaskId: saved.activeTaskId || initialTasks[0]?.id || null,
  session: saved.session || null,
  appearance: ['system', 'light', 'dark'].includes(saved.appearance) ? saved.appearance : 'system',
  migratedFrom: saved.migratedFrom || null,

  setView: (view) => set({ view }),
  setAppearance: (appearance) => set({ appearance }),
  setActiveTask: (activeTaskId) => set({ activeTaskId, view: 'today' }),

  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, normaliseTask({ ...task, createdByUser: true }, state.tasks.length)],
  })),
  updateTask: (task) => set((state) => ({
    tasks: state.tasks.map((item) => item.id === task.id ? normaliseTask(task) : item),
  })),
  deleteTask: (taskId) => set((state) => {
    const tasks = state.tasks.filter((item) => item.id !== taskId);
    const activeTaskId = state.activeTaskId === taskId ? tasks[0]?.id || null : state.activeTaskId;
    const session = state.session?.taskId === taskId ? null : state.session;
    return { tasks, activeTaskId, session, view: session ? state.view : 'tasks' };
  }),

  addCategory: ({ label, tone }) => set((state) => {
    const base = String(label || 'New category').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'category';
    let id = base;
    let suffix = 2;
    while (state.categories.some((item) => item.id === id)) id = `${base}-${suffix++}`;
    return { categories: [...state.categories, { id, label: String(label || 'New category').trim(), icon: 'tag', tone: tone || 'slate', locked: false }] };
  }),
  updateCategory: (category) => set((state) => ({
    categories: state.categories.map((item) => item.id === category.id ? { ...item, label: category.label || item.label, tone: category.tone || item.tone } : item),
  })),
  deleteCategory: (categoryId) => set((state) => {
    const category = state.categories.find((item) => item.id === categoryId);
    if (!category || category.locked) return state;
    return {
      categories: state.categories.filter((item) => item.id !== categoryId),
      tasks: state.tasks.map((task) => task.category === categoryId ? { ...task, category: 'organise' } : task),
    };
  }),

  startTask: (taskId, version) => set((state) => {
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) return state;
    return {
      activeTaskId: taskId,
      session: {
        taskId,
        version,
        phase: task.preserve ? 'preservation' : 'steps',
        protectedItems: [],
        stepIndex: 0,
        cycles: 0,
        minimumDecision: false,
        startedAt: new Date().toISOString(),
      },
      view: 'active',
    };
  }),
  confirmPreservation: (protectedItems) => set((state) => state.session ? {
    session: { ...state.session, phase: 'steps', protectedItems: Array.isArray(protectedItems) ? protectedItems : [] },
  } : state),
  nextStep: () => set((state) => {
    if (!state.session) return state;
    const task = state.tasks.find((item) => item.id === state.session.taskId);
    if (!task) return { session: null, view: 'today' };
    return { session: { ...state.session, stepIndex: Math.min(task.steps.length - 1, state.session.stepIndex + 1) } };
  }),
  previousStep: () => set((state) => state.session ? {
    session: { ...state.session, stepIndex: Math.max(0, state.session.stepIndex - 1), minimumDecision: false },
  } : state),
  answerDishQuestion: (allRemoved) => {
    const state = get();
    if (!state.session) return;
    if (allRemoved) return get().completeSession('All bedroom dishes removed');
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
      category: task?.category || 'organise',
      version: state.session.version,
      result,
      cycles: state.session.cycles,
      protectedItems: state.session.protectedItems,
      startedAt: state.session.startedAt,
      completedAt: new Date().toISOString(),
    };
    return { history: [record, ...state.history], session: null, view: 'today' };
  }),
  stopSession: () => set({ session: null, view: 'today' }),

  addWardrobeItem: (item) => set((state) => ({
    wardrobe: [{ ...item, id: `wardrobe-${Date.now()}`, createdAt: new Date().toISOString() }, ...state.wardrobe],
  })),
  updateWardrobeItem: (item) => set((state) => ({
    wardrobe: state.wardrobe.map((entry) => entry.id === item.id ? item : entry),
  })),
  deleteWardrobeItem: (itemId) => set((state) => ({ wardrobe: state.wardrobe.filter((entry) => entry.id !== itemId) })),

  importState: (payload) => set((state) => ({
    tasks: Array.isArray(payload.tasks) ? payload.tasks.map(normaliseTask) : state.tasks,
    categories: Array.isArray(payload.categories) ? payload.categories : state.categories,
    history: Array.isArray(payload.history) ? payload.history : state.history,
    wardrobe: Array.isArray(payload.wardrobe) ? payload.wardrobe : state.wardrobe,
    activeTaskId: payload.activeTaskId || state.activeTaskId,
    session: payload.session || null,
    appearance: ['system', 'light', 'dark'].includes(payload.appearance) ? payload.appearance : state.appearance,
  })),
}));

if (typeof window !== 'undefined') {
  useAppStore.subscribe((state) => {
    const payload = {
      tasks: state.tasks,
      categories: state.categories,
      history: state.history,
      wardrobe: state.wardrobe,
      activeTaskId: state.activeTaskId,
      session: state.session,
      appearance: state.appearance,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // The interface remains usable even when browser storage is unavailable.
    }
  });
}
