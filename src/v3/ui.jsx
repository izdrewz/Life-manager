import React from 'react';
import { Archive, BookOpen, CircleHelp, Home, Layers3, ListTodo, MoreHorizontal, Plus, Shirt, Sparkles, Star, Tag, Trash2, Utensils } from 'lucide-react';
import { useAppStore } from './store.js';

export const ICONS = {
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

export const NAV_ITEMS = [
  { id: 'today', label: 'Today', icon: Home },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'advice', label: 'Advice', icon: BookOpen },
  { id: 'more', label: 'More', icon: MoreHorizontal },
];

export function categoryFor(categories, id) {
  return categories.find((item) => item.id === id) || categories.find((item) => item.id === 'organise') || {
    id: 'organise', label: 'Organisation', icon: 'archive', tone: 'slate',
  };
}

export function CategoryBadge({ categoryId }) {
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

export function AppHeader({ onOpenIndex, onOpenCapture }) {
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

export function Navigation({ view, onChange }) {
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
