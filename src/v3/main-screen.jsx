import React from 'react';
import { ChevronRight, CircleHelp, CircleStop, ClipboardList, Menu, Play, Plus, Sparkles, Tag } from 'lucide-react';
import { useAppStore } from './store.js';
import { CategoryBadge, ICONS, categoryFor } from './ui.jsx';

export function StateStrip({ task, session }) {
  const state = session ? 'active' : task?.mode === 'maintenance' ? 'maintenance' : 'recovery';
  const content = {
    active: ['Active session', 'Your unfinished task is saved. Continue from the exact step when you are ready.'],
    recovery: ['Room reset', 'The ordered recovery route is active. Only one current task is shown.'],
    maintenance: ['Maintenance', 'Choose only what needs attention now. Missed days do not create debt.'],
  }[state];
  return <section className={`state-strip state-${state}`}><strong>{content[0]}</strong><span>{content[1]}</span></section>;
}

export function ContinueSessionCard({ task, session, onResume, onEnd }) {
  const categories = useAppStore((state) => state.categories);
  const category = categoryFor(categories, task.category);
  const Icon = ICONS[category.icon] || Tag;
  const phaseLabel = session.phase === 'preservation-question'
    ? 'Protection check'
    : session.phase === 'preservation-builder'
      ? 'Protected-item builder'
      : `Instruction ${session.stepIndex + 1} of ${task.steps.length}`;
  const current = session.phase === 'steps' ? task.steps[session.stepIndex] : 'Finish the protection check before the cleaning instructions begin.';
  return (
    <article className={`focus-card continue-card tone-${category.tone}`}>
      <div className="focus-visual" aria-hidden="true"><Icon size={32} strokeWidth={2.2} /></div>
      <div className="focus-copy">
        <CategoryBadge categoryId={task.category} />
        <p className="overline">Unfinished task · {phaseLabel}</p>
        <h2>{task.title}</h2>
        <p className="start-line"><strong>Saved place:</strong> {current}</p>
      </div>
      <div className="focus-actions">
        <button className="primary-action" onClick={onResume}><Play size={19} fill="currentColor" />Continue this task</button>
        <button className="secondary-action" onClick={onEnd}><CircleStop size={19} />End this task</button>
      </div>
      <p className="counts-note">Nothing has been discarded. Continue from the saved place or deliberately end the session.</p>
    </article>
  );
}

export function FocusCard({ task, onStart }) {
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
      <p className="counts-note">{task.loop === 'dishes' ? 'Repeat the carrier steps until the answer is Yes.' : 'The smaller version counts as complete.'}</p>
    </article>
  );
}

export function TodayScreen({ onOpenIndex, onOpenCapture, onChooseCondition }) {
  const tasks = useAppStore((state) => state.tasks);
  const activeTaskId = useAppStore((state) => state.activeTaskId);
  const session = useAppStore((state) => state.session);
  const startTask = useAppStore((state) => state.startTask);
  const resumeSession = useAppStore((state) => state.resumeSession);
  const abandonSession = useAppStore((state) => state.abandonSession);
  const setView = useAppStore((state) => state.setView);
  const suggestedTask = tasks.find((item) => item.id === activeTaskId) || tasks[0];
  const sessionTask = tasks.find((item) => item.id === session?.taskId);
  const task = sessionTask || suggestedTask;

  if (!task) return <section className="screen empty-screen"><h1>No tasks yet.</h1><button className="primary-action" onClick={onOpenCapture}>Add a task</button></section>;

  const endSession = () => {
    if (window.confirm(`End “${sessionTask?.title || 'this task'}”? The saved step will be removed.`)) abandonSession();
  };

  return (
    <section className="screen today-screen">
      <div className="welcome-row">
        <div><p className="eyebrow">Hello, Izzy</p><h1>{session ? 'Continue where you left off.' : 'Pick one useful thing.'}</h1></div>
        <button className="mobile-menu-button" onClick={onOpenIndex}><Menu size={21} /> Find anything</button>
      </div>
      <StateStrip task={task} session={session} />
      <div className="today-layout">
        {session && sessionTask
          ? <ContinueSessionCard task={sessionTask} session={session} onResume={resumeSession} onEnd={endSession} />
          : <FocusCard task={task} onStart={startTask} />}
        <aside className="support-column" aria-label="Other routes">
          <section className="support-card warm">
            <div className="support-heading"><span className="mini-icon"><Sparkles size={18} /></span><div><p className="overline">Room state</p><h3>{session ? 'Your place is saved' : task.mode === 'recovery' ? 'Room reset is active' : 'Keep the room usable'}</h3></div></div>
            <p>{session ? 'Browsing another page will not discard the current instruction or protection draft.' : task.mode === 'recovery' ? 'The ordered reset route stays available without filling this screen.' : 'Choose only what needs attention now. Missed days do not build up.'}</p>
            <button onClick={() => setView('tasks')}>Choose another task <ChevronRight size={17} /></button>
          </section>
          <div className="route-grid">
            <button className="route-card coral" onClick={onChooseCondition}><ClipboardList size={22} /><span><strong>Something changed</strong><small>Tell the app what is true in the room now</small></span><ChevronRight size={18} /></button>
            <button className="route-card sage" onClick={onOpenCapture}><Plus size={22} /><span><strong>Add something quickly</strong><small>Save it first; details can wait</small></span><ChevronRight size={18} /></button>
            <button className="route-card blue" onClick={onOpenIndex}><CircleHelp size={22} /><span><strong>I’m lost</strong><small>Find a page, action, instruction or prompt</small></span><ChevronRight size={18} /></button>
          </div>
        </aside>
      </div>
    </section>
  );
}
