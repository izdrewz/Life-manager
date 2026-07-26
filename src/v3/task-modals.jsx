import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { TONES } from './data.js';
import { useAppStore } from './store.js';

export function ModalFrame({ children, onClose, wide = false, className = '' }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><section className={`sheet ${wide ? 'wide-sheet' : ''} ${className}`} onMouseDown={(event) => event.stopPropagation()}><div className="sheet-handle" />{children}</section></div>;
}

export function QuickCapture({ open, onClose, initialType = 'oneoff' }) {
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

export function TaskEditor({ task, onClose }) {
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

export function CategoryManager({ open, onClose }) {
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

export function AdviceDetail({ item, onClose }) {
  if (!item) return null;
  return <ModalFrame onClose={onClose}><div className="sheet-header"><div><p className="eyebrow">{item.type}</p><h2>{item.title}</h2></div><button className="icon-button" onClick={onClose}><X /></button></div><p className="advice-lead">{item.summary}</p><ol className="advice-steps">{item.body.map((paragraph) => <li key={paragraph}>{paragraph}</li>)}</ol></ModalFrame>;
}
