# Life Manager React rebuild

Branch: `react-rebuild-dailywave`

This branch is deliberately separate from the live `main` branch.

## Implemented

- React 18 + Vite + Zustand foundation
- responsive phone bottom navigation and laptop sidebar
- one-current-task Today screen
- active-session state strip and Continue card on Today
- exact-step session persistence when using Save and leave
- room-condition chooser that selects the matching cleaning task
- category-coloured cleaning tasks with separate Recovery and Maintenance state styling
- active task screen that shows one instruction at a time
- locked dish carrier repeat-until-Yes flow; No returns to instructions 1 and 2
- automatic repair of migrated dish-task wording and steps
- valid smaller and full task versions without catch-up debt
- approved preservation question before disruptive tasks
- protected-item builder with event/day, category, subcategory, item and safe-place fields
- quick capture for one-off or permanent tasks
- full task editor with ordered instructions
- permanent category manager with editable names and colours
- task search and filtering
- Advice detail sheets
- Wardrobe records with optional local photos, locations and reserve/current status
- History and backup export/import
- expanded Index / I’m lost directory using scenario wording
- copyable ChatGPT prompts for locked-rule changes, missing features, bugs and sync conflicts
- system, light and dark appearance choices
- Calm view, larger text and reduced-motion controls
- local browser autosave
- migration from the previous React and legacy cleaning local-storage keys
- locked-rule verification automatically run before every production build
- build workflow and open-source notices

## Still required before replacing the live site

- hands-on phone and laptop testing
- correction of any issues found in those screenshots
- complete book-source register and detailed source pages
- production Calendar or Esslay synchronisation
- cloud accounts and cross-device sync
- voice capture
- final accessibility review

## Acceptance rule

The branch remains separate until the responsive interface and task flow have been tested. It must not replace `main` simply because it builds successfully.
