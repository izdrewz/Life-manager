import React, { useEffect, useState } from 'react';
import { ChevronRight, ImagePlus, Trash2, X } from 'lucide-react';
import { ROOM_CONDITIONS } from './data.js';
import { useAppStore } from './store.js';
import { ModalFrame } from './task-modals.jsx';

export function ConditionChooser({ open, onClose }) {
  const tasks = useAppStore((state) => state.tasks);
  const setActiveTask = useAppStore((state) => state.setActiveTask);
  if (!open) return null;
  const choose = (condition) => { if (tasks.some((task) => task.id === condition.taskId)) setActiveTask(condition.taskId); onClose(); };
  return <ModalFrame onClose={onClose}><div className="sheet-header"><div><p className="eyebrow">What needs attention?</p><h2>Choose the sentence that is true now.</h2></div><button className="icon-button" onClick={onClose}><X /></button></div><div className="condition-list">{ROOM_CONDITIONS.map((condition) => <button className={`condition-button tone-${condition.tone}`} key={condition.id} onClick={() => choose(condition)}><span className="tone-dot" /><span>{condition.label}</span><ChevronRight size={18} /></button>)}</div></ModalFrame>;
}

export function WardrobeEditor({ item, open, onClose }) {
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
