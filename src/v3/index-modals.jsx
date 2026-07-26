import React, { useState } from 'react';
import { ChevronRight, Copy, Search, X } from 'lucide-react';
import { ModalFrame } from './task-modals.jsx';

export const PROMPTS = {
  'prompt-rule': 'I need to revise locked rule [RULE ID]. Show the current wording, my requested change and an exact change log. Do not apply or lock anything until I approve it.',
  'prompt-missing': 'I am using my cleaning app and need help with [WHAT I NEED]. Current page: [PAGE]. Current task or category: [TASK/CATEGORY]. Keep the existing approved system and tell me exactly what should be added or changed without silently replacing anything.',
  'prompt-bug': 'In my cleaning app, [SCREEN OR ACTION] is confusing or broken. I expected [EXPECTED RESULT] but instead [ACTUAL RESULT]. Preserve the approved blueprint and give an exact proposed fix with no unrelated changes.',
  'prompt-sync': 'A cleaning-task completion did not match Calendar or Esslay. Help me compare the Life Manager completion record with the external status, choose the correct record and make the safest manual correction. Do not silently overwrite either side.',
};

const INDEX_GROUPS = [
  { title: 'Do something now', items: [
    { label: 'Know what I should do next', terms: 'next now start overwhelmed current', action: 'today' },
    { label: 'Continue the task I already started', terms: 'continue resume active saved', action: 'active' },
    { label: 'Choose a different cleaning task', terms: 'different another browse pick', action: 'tasks' },
    { label: 'Tell the app something in my room changed', terms: 'changed mess condition dishes rubbish clothes bed route', action: 'condition' },
    { label: 'Restart after the room has slipped', terms: 'restart relapse recovery overwhelmed', action: 'condition' },
    { label: 'Run a maintenance check', terms: 'maintenance scan check stable', action: 'condition' },
  ] },
  { title: 'Create or change', items: [
    { label: 'Add a permanent cleaning task', terms: 'new permanent recurring', action: 'capture-permanent' },
    { label: 'Add a one-off cleaning task', terms: 'new temporary one off', action: 'capture-oneoff' },
    { label: 'Edit an existing task and its instructions', terms: 'change steps minimum full supplies', action: 'tasks' },
    { label: 'Add or edit a permanent category', terms: 'category colours reusable', action: 'categories' },
    { label: 'Set aside protected items before disruptive work', terms: 'preserve protect event day outfit', action: 'tasks' },
    { label: 'Log or photograph a clothing item', terms: 'clothes photo scan wardrobe', action: 'wardrobe-add' },
  ] },
  { title: 'Find guidance, clothes or progress', items: [
    { label: 'Find advice for the task I am doing', terms: 'advice how support method', action: 'advice' },
    { label: 'Browse guidance from books', terms: 'book KC Davis Emma Lei', action: 'advice' },
    { label: 'Find one of my personal cleaning rules', terms: 'my rule personal locked', action: 'advice' },
    { label: 'Find where a clothing item is stored', terms: 'find clothes location wardrobe', action: 'wardrobe' },
    { label: 'Review the body-change reserve', terms: 'body change reserve box', action: 'wardrobe' },
    { label: 'See what I completed and what remains', terms: 'history completed next remains', action: 'more' },
  ] },
  { title: 'Connections, backups and appearance', items: [
    { label: 'Open or connect Calendar', terms: 'calendar schedule linked', action: 'settings' },
    { label: 'Open or connect Esslay', terms: 'esslay game reward', action: 'settings' },
    { label: 'Fix a completion that did not sync', terms: 'sync conflict done calendar esslay', action: 'prompt-sync' },
    { label: 'Export a backup', terms: 'backup export save data', action: 'more' },
    { label: 'Restore or import a backup', terms: 'restore import backup data', action: 'more' },
    { label: 'Change appearance, text size or Calm view', terms: 'appearance colours calm text size motion', action: 'settings' },
  ] },
  { title: 'Ask ChatGPT', items: [
    { label: 'Propose a change to a locked personal rule', terms: 'revise locked rule prompt', action: 'prompt-rule' },
    { label: 'Get help adding something the app cannot do yet', terms: 'missing feature help prompt', action: 'prompt-missing' },
    { label: 'Report that part of the app is confusing or broken', terms: 'bug broken confusing navigation button', action: 'prompt-bug' },
  ] },
];

export function IndexDialog({ open, onClose, onAction }) {
  const [query, setQuery] = useState('');
  if (!open) return null;
  const search = query.toLowerCase().trim();
  const groups = INDEX_GROUPS.map((group) => ({ ...group, items: group.items.filter((item) => `${item.label} ${item.terms || ''}`.toLowerCase().includes(search)) })).filter((group) => group.items.length);
  return <div className="modal-backdrop index-backdrop" onMouseDown={onClose}><section className="index-dialog" onMouseDown={(event) => event.stopPropagation()}><div className="sheet-header"><div><p className="eyebrow">Index / I’m lost</p><h2>What are you trying to do?</h2></div><button className="icon-button" onClick={onClose}><X /></button></div><label className="search-box"><Search size={19} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Add a task, find clothes, change appearance…" /></label><div className="index-groups">{groups.map((group) => <section key={group.title} className="index-group"><h3>{group.title}</h3>{group.items.map((item) => <button key={item.label} onClick={() => { onAction(item.action); onClose(); }}><span>I need to {item.label.charAt(0).toLowerCase() + item.label.slice(1)}</span>{item.action.startsWith('prompt-') ? <Copy size={18} /> : <ChevronRight size={18} />}</button>)}</section>)}{groups.length === 0 && <p className="empty-copy">No exact match. Try a shorter word such as “task”, “clothes”, “advice”, “backup” or “broken”.</p>}</div></section></div>;
}

export function PromptDialog({ prompt, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!prompt) return null;
  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return <ModalFrame onClose={onClose}><div className="sheet-header"><div><p className="eyebrow">Copyable ChatGPT prompt</p><h2>Use this without changing the approved system silently.</h2></div><button className="icon-button" onClick={onClose}><X /></button></div><textarea className="prompt-text" readOnly value={prompt} onFocus={(event) => event.target.select()} /><button className="primary-action" onClick={copyPrompt}><Copy size={18} />{copied ? 'Copied' : 'Copy prompt'}</button><p className="sheet-note">Replace the words in square brackets before sending it.</p></ModalFrame>;
}
