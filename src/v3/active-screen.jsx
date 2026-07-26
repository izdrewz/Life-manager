import React, { useEffect } from 'react';
import { ArrowLeft, Check, ChevronRight, CircleStop, Plus } from 'lucide-react';
import { useAppStore } from './store.js';
import { CategoryBadge, categoryFor } from './ui.jsx';

export function PreservationQuestion({ task, onYes, onNo, onLeave }) {
  return (
    <section className="screen active-screen">
      <button className="back-link" onClick={onLeave}><ArrowLeft size={18} /> Save and leave</button>
      <div className="preservation-shell">
        <p className="eyebrow">Protection check · before {task.title.toLowerCase()}</p>
        <h1>Do you need to preserve anything for an upcoming event or day?</h1>
        <p className="lead-copy">Examples include an outfit, documents, a charger, food or anything that must not be bagged, moved or damaged during this task.</p>
        <div className="preservation-actions">
          <button className="primary-action" onClick={onYes}>Yes — list protected items</button>
          <button className="secondary-action" onClick={() => onNo([])}>No — begin the task</button>
        </div>
      </div>
    </section>
  );
}

const emptyProtectedGroup = () => ({
  id: `protected-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  categoryId: 'clothes',
  customCategory: '',
  subcategory: '',
  items: '',
  safePlace: '',
  scope: 'oneoff',
});

export function PreservationBuilder({ task, draft, categories, onDraft, onBack, onConfirm, onLeave }) {
  const groups = Array.isArray(draft?.groups) ? draft.groups : [];
  const reason = draft?.reason || '';

  useEffect(() => {
    if (!groups.length) onDraft({ reason, groups: [emptyProtectedGroup()] });
  }, []);

  const updateGroup = (id, patch) => onDraft({ reason, groups: groups.map((group) => group.id === id ? { ...group, ...patch } : group) });
  const removeGroup = (id) => onDraft({ reason, groups: groups.filter((group) => group.id !== id) });
  const addGroup = () => onDraft({ reason, groups: [...groups, emptyProtectedGroup()] });
  const validGroups = groups.filter((group) => {
    const category = group.categoryId === '__new__' ? group.customCategory.trim() : categories.find((item) => item.id === group.categoryId)?.label;
    return category && group.items.trim() && group.safePlace.trim();
  });
  const save = () => {
    const protectedItems = validGroups.map((group) => ({
      id: group.id,
      reason: reason.trim(),
      category: group.categoryId === '__new__' ? group.customCategory.trim() : categories.find((item) => item.id === group.categoryId)?.label,
      subcategory: group.subcategory.trim(),
      items: group.items.split(/\n|,/).map((item) => item.trim()).filter(Boolean),
      safePlace: group.safePlace.trim(),
      scope: group.scope,
    }));
    onConfirm(protectedItems);
  };

  return (
    <section className="screen active-screen">
      <button className="back-link" onClick={onLeave}><ArrowLeft size={18} /> Save and leave</button>
      <div className="preservation-shell builder-shell">
        <p className="eyebrow">Protected-item builder · before {task.title.toLowerCase()}</p>
        <h1>List what must stay safe and where it will wait.</h1>
        <label className="safe-place-field">Upcoming event or day <input value={reason} onChange={(event) => onDraft({ reason: event.target.value, groups })} placeholder="For example: appointment outfit on Friday" /></label>
        <div className="protected-group-list">
          {groups.map((group, index) => (
            <section className="protected-group" key={group.id}>
              <header><strong>Protected group {index + 1}</strong>{groups.length > 1 && <button type="button" className="text-action" onClick={() => removeGroup(group.id)}>Remove group</button>}</header>
              <div className="form-grid">
                <label>Category<select value={group.categoryId} onChange={(event) => updateGroup(group.id, { categoryId: event.target.value })}>{categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}<option value="__new__">Create a new protected category</option></select></label>
                {group.categoryId === '__new__' && <label>New category name<input value={group.customCategory} onChange={(event) => updateGroup(group.id, { customCategory: event.target.value })} placeholder="For example: Appointment items" /></label>}
                <label>Subcategory <input value={group.subcategory} onChange={(event) => updateGroup(group.id, { subcategory: event.target.value })} placeholder="For example: Friday outfit" /></label>
                <fieldset><legend>Keep this category for</legend><div className="segmented"><button type="button" className={group.scope === 'oneoff' ? 'active' : ''} onClick={() => updateGroup(group.id, { scope: 'oneoff' })}>This task only</button><button type="button" className={group.scope === 'permanent' ? 'active' : ''} onClick={() => updateGroup(group.id, { scope: 'permanent' })}>Future checks too</button></div></fieldset>
              </div>
              <label>Specific items<textarea value={group.items} onChange={(event) => updateGroup(group.id, { items: event.target.value })} placeholder="One item per line, or separate items with commas" /></label>
              <label>Safe place<input value={group.safePlace} onChange={(event) => updateGroup(group.id, { safePlace: event.target.value })} placeholder="For example: top drawer or labelled box" /></label>
            </section>
          ))}
        </div>
        <button className="secondary-action add-protected-group" type="button" onClick={addGroup}><Plus size={17} /> Add another category</button>
        <div className="preservation-actions">
          <button className="primary-action" disabled={!groups.length || validGroups.length !== groups.length} onClick={save}>Protect these items and begin</button>
          <button className="secondary-action" onClick={onBack}>Back to Yes or No</button>
        </div>
        {groups.length > 0 && validGroups.length !== groups.length && <p className="sheet-note">Each protected group needs a category, at least one item and a named safe place.</p>}
      </div>
    </section>
  );
}

export function ProtectedSummary({ items }) {
  if (!items?.length) return null;
  return <details className="protected-summary"><summary>Protected before starting</summary><ul>{items.map((item) => typeof item === 'string' ? <li key={item}>{item}</li> : <li key={item.id}><strong>{item.category}{item.subcategory ? ` · ${item.subcategory}` : ''}</strong>: {item.items.join(', ')} → {item.safePlace}</li>)}</ul></details>;
}

export function ActiveTaskScreen() {
  const tasks = useAppStore((state) => state.tasks);
  const categories = useAppStore((state) => state.categories);
  const session = useAppStore((state) => state.session);
  const nextStep = useAppStore((state) => state.nextStep);
  const previousStep = useAppStore((state) => state.previousStep);
  const leaveSession = useAppStore((state) => state.leaveSession);
  const abandonSession = useAppStore((state) => state.abandonSession);
  const completeSession = useAppStore((state) => state.completeSession);
  const answerDishQuestion = useAppStore((state) => state.answerDishQuestion);
  const openPreservationBuilder = useAppStore((state) => state.openPreservationBuilder);
  const returnToPreservationQuestion = useAppStore((state) => state.returnToPreservationQuestion);
  const updatePreservationDraft = useAppStore((state) => state.updatePreservationDraft);
  const confirmPreservation = useAppStore((state) => state.confirmPreservation);
  const task = tasks.find((item) => item.id === session?.taskId);

  if (!task || !session) return null;
  if (session.phase === 'preservation-question') return <PreservationQuestion task={task} onYes={openPreservationBuilder} onNo={confirmPreservation} onLeave={leaveSession} />;
  if (session.phase === 'preservation-builder') return <PreservationBuilder task={task} draft={session.preservationDraft} categories={categories} onDraft={updatePreservationDraft} onBack={returnToPreservationQuestion} onConfirm={confirmPreservation} onLeave={leaveSession} />;

  const category = categoryFor(categories, task.category);
  const isDishQuestion = task.loop === 'dishes' && session.stepIndex === 2;
  const isFinalOrdinaryStep = task.loop !== 'dishes' && session.stepIndex === task.steps.length - 1;
  const currentStep = task.steps[session.stepIndex];
  const endTask = () => {
    if (window.confirm(`End “${task.title}”? The saved step will be removed.`)) abandonSession();
  };

  return (
    <section className="screen active-screen">
      <div className="active-session-toolbar"><button className="back-link" onClick={leaveSession}><ArrowLeft size={18} /> Save and leave</button><button className="text-action danger-text" onClick={endTask}><CircleStop size={17} /> End task</button></div>
      <div className={`active-task-shell tone-${category.tone}`}>
        <div className="active-task-topline"><CategoryBadge categoryId={task.category} /><span>{session.version === 'minimum' ? 'Smaller version' : 'Full version'}</span></div>
        <p className="overline">{task.title}</p>
        <div className="step-counter">Instruction {session.stepIndex + 1} of {task.steps.length}</div>
        <h1>{currentStep}</h1>
        <ProtectedSummary items={session.protectedItems} />

        {isDishQuestion ? (
          <div className="answer-grid">
            <button className="primary-action" onClick={() => answerDishQuestion(true)}><Check size={20} /> Yes — complete task</button>
            <button className="secondary-action" onClick={() => answerDishQuestion(false)}>No — repeat instructions 1 and 2</button>
          </div>
        ) : (
          <div className="active-actions">
            {session.stepIndex > 0 && <button className="text-action" onClick={previousStep}>Back</button>}
            {isFinalOrdinaryStep ? <button className="primary-action" onClick={() => completeSession()}>Done <Check size={20} /></button> : <button className="primary-action" onClick={nextStep}>Done — next instruction <ChevronRight size={20} /></button>}
          </div>
        )}
      </div>
      <p className="active-help">Only the current instruction is shown. Save and leave keeps this exact place.</p>
    </section>
  );
}
