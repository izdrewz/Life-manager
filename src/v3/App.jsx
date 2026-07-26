import React, { useEffect, useState } from 'react';
import { useAppStore } from './store.js';
import { AppHeader, Navigation } from './ui.jsx';
import { TodayScreen } from './main-screen.jsx';
import { ActiveTaskScreen } from './active-screen.jsx';
import { AdviceScreen, MoreScreen, SettingsScreen, TasksScreen, WardrobeScreen } from './library-screens.jsx';
import { AdviceDetail, CategoryManager, QuickCapture, TaskEditor } from './task-modals.jsx';
import { ConditionChooser, WardrobeEditor } from './utility-modals.jsx';
import { IndexDialog, PROMPTS, PromptDialog } from './index-modals.jsx';

export default function App() {
  const view = useAppStore((state) => state.view);
  const setView = useAppStore((state) => state.setView);
  const session = useAppStore((state) => state.session);
  const appearance = useAppStore((state) => state.appearance);
  const calmView = useAppStore((state) => state.calmView);
  const textScale = useAppStore((state) => state.textScale);
  const reducedMotion = useAppStore((state) => state.reducedMotion);
  const resumeSession = useAppStore((state) => state.resumeSession);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [captureType, setCaptureType] = useState('oneoff');
  const [indexOpen, setIndexOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [adviceItem, setAdviceItem] = useState(null);
  const [conditionOpen, setConditionOpen] = useState(false);
  const [wardrobeEditorOpen, setWardrobeEditorOpen] = useState(false);
  const [wardrobeItem, setWardrobeItem] = useState(null);
  const [promptText, setPromptText] = useState('');

  useEffect(() => {
    document.documentElement.dataset.theme = appearance;
    document.documentElement.dataset.calm = calmView ? 'true' : 'false';
    document.documentElement.dataset.text = textScale;
    document.documentElement.dataset.motion = reducedMotion ? 'reduced' : 'standard';
  }, [appearance, calmView, textScale, reducedMotion]);

  const visibleView = session && view === 'active' ? 'active' : view;
  const openCapture = (type = 'oneoff') => { setCaptureType(type); setCaptureOpen(true); };
  const openWardrobeEditor = (item = null) => { setWardrobeItem(item); setWardrobeEditorOpen(true); };
  const navigate = (destination) => { setView(destination); window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }); };
  const handleIndexAction = (action) => {
    if (action === 'capture-oneoff') return openCapture('oneoff');
    if (action === 'capture-permanent') return openCapture('permanent');
    if (action === 'categories') return setCategoriesOpen(true);
    if (action === 'condition') return setConditionOpen(true);
    if (action === 'wardrobe-add') { navigate('wardrobe'); return openWardrobeEditor(); }
    if (action.startsWith('prompt-')) return setPromptText(PROMPTS[action] || PROMPTS['prompt-missing']);
    if (action === 'active') return session ? resumeSession() : navigate('today');
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
      <PromptDialog prompt={promptText} onClose={() => setPromptText('')} />
    </div>
  );
}
