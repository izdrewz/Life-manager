(() => {
  'use strict';

  const LAYOUT_KEY = 'life-manager-layout-mode';
  const DESKTOP_QUERY = window.matchMedia('(min-width: 860px)');

  function replaceText(element, from, to) {
    if (element && element.textContent.trim() === from) element.textContent = to;
  }

  function preferredLayout() {
    if (!DESKTOP_QUERY.matches) return 'focus';
    return localStorage.getItem(LAYOUT_KEY) || 'plan';
  }

  function applyLayout(mode = preferredLayout()) {
    const resolved = DESKTOP_QUERY.matches ? mode : 'focus';
    document.body.classList.toggle('layout-plan', resolved === 'plan');
    document.body.classList.toggle('layout-focus', resolved === 'focus');
    document.querySelectorAll('[data-layout-mode]').forEach(button => {
      const selected = button.dataset.layoutMode === resolved;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  function ensureLayoutSwitch() {
    const topbar = document.querySelector('.topbar');
    const indexButton = document.getElementById('openIndex');
    if (!topbar || !indexButton || topbar.querySelector('.layout-switch')) return;

    const switcher = document.createElement('div');
    switcher.className = 'layout-switch';
    switcher.setAttribute('aria-label', 'Page layout');
    switcher.innerHTML = `
      <button type="button" data-layout-mode="focus" aria-pressed="false">Focus</button>
      <button type="button" data-layout-mode="plan" aria-pressed="false">Plan</button>`;
    topbar.insertBefore(switcher, indexButton);

    switcher.addEventListener('click', event => {
      const button = event.target.closest('[data-layout-mode]');
      if (!button || !DESKTOP_QUERY.matches) return;
      localStorage.setItem(LAYOUT_KEY, button.dataset.layoutMode);
      applyLayout(button.dataset.layoutMode);
    });
  }

  function makeQuickAction(action, icon, title, detail) {
    return `<button class="quick-action" type="button" data-action="${action}">
      <span class="quick-icon" aria-hidden="true">${icon}</span>
      <span><strong>${title}</strong><small>${detail}</small></span>
      <span aria-hidden="true">›</span>
    </button>`;
  }

  function enhanceMain() {
    const mainTitle = document.getElementById('main-title');
    const mainScreen = mainTitle?.closest('.screen');
    if (!mainScreen) return;

    mainScreen.classList.add('main-screen', 'start-screen');

    replaceText(mainTitle, 'Main', 'Start');
    replaceText(mainTitle, 'Start here', 'Start');
    const subtitle = mainScreen.querySelector('.screen-title p');
    if (subtitle) subtitle.textContent = 'One useful action. Nothing else is required.';

    const taskCard = mainScreen.querySelector('.task-card');
    if (taskCard && !taskCard.dataset.focusEnhanced) {
      taskCard.dataset.focusEnhanced = 'true';
      taskCard.classList.add('focus-card');
      const heading = taskCard.querySelector('.task-heading');
      if (heading) {
        const now = document.createElement('p');
        now.className = 'now-label';
        now.textContent = 'Do this now';
        heading.parentNode.insertBefore(now, heading);
      }
    }

    if (taskCard) {
      const stepLabel = taskCard.querySelector('.task-first-step strong');
      replaceText(stepLabel, 'First action', 'Start with');

      const title = taskCard.querySelector('h2')?.textContent.trim() || '';
      const primary = taskCard.querySelector('.primary-button');
      const secondary = taskCard.querySelector('.secondary-button');
      const note = taskCard.querySelector('.subtle-note');

      if (title === 'Take dishes to the kitchen') {
        if (primary) primary.textContent = 'Take one load';
        if (secondary) secondary.textContent = 'Remove all dishes';
        if (note) note.textContent = 'One load is a complete small version.';
      } else {
        replaceText(primary, 'Minimum', 'Do the small version');
        replaceText(primary, 'Small version', 'Do the small version');
        replaceText(secondary, 'Full', 'Do the full task');
        replaceText(secondary, 'Full task', 'Do the full task');
        if (note) note.textContent = 'The small version still counts as complete.';
      }
    }

    const stateStrip = mainScreen.querySelector('.state-strip');
    if (stateStrip) {
      stateStrip.classList.add('room-status-card');
      const strong = stateStrip.querySelector('.state-copy strong');
      const detail = stateStrip.querySelector('.state-copy span');
      const button = stateStrip.querySelector('button');
      if (strong?.textContent.trim() === 'Recovery mode' || strong?.textContent.trim() === 'Room reset') {
        strong.textContent = 'Room reset is active';
        if (detail) detail.textContent = 'The reset plan stays available, but you only need the task shown.';
        if (button) button.textContent = 'Open plan';
      } else if (strong?.textContent.trim() === 'Maintenance mode' || strong?.textContent.trim() === 'Keep it usable') {
        strong.textContent = 'Keep the room usable';
        if (detail) detail.textContent = 'Choose what needs attention now. Missed days do not build up.';
        if (button) button.textContent = 'Check room';
      }
    }

    const quickGrid = mainScreen.querySelector('.quick-grid');
    if (quickGrid && !quickGrid.dataset.choiceEnhanced) {
      quickGrid.dataset.choiceEnhanced = 'true';
      quickGrid.classList.add('choice-panel');
      const recoveryActive = Boolean(stateStrip?.classList.contains('recovery'));
      quickGrid.innerHTML = `
        <div class="choice-heading">
          <p class="eyebrow">Choose instead</p>
          <h3>What would help?</h3>
        </div>
        ${makeQuickAction('run-scan', '◎', 'Choose what needs attention', 'Dishes, rubbish, clothes, bed, route or floor')}
        ${makeQuickAction(recoveryActive ? 'show-recovery' : 'run-scan', '↻', recoveryActive ? 'Open the room-reset plan' : 'Run a quick room check', recoveryActive ? 'See the ordered reset tasks' : 'Find the current useful task')}
        ${makeQuickAction('choose-task', '☷', 'Browse or add tasks', 'Search, add a permanent task or add a one-off task')}
        ${makeQuickAction('open-index', '?', 'I am lost', 'Find any page, action or ChatGPT prompt')}`;
    }
  }

  function enhanceNavigation() {
    document.querySelectorAll('[data-nav]').forEach(button => {
      const label = button.querySelector('span:last-child');
      if (button.dataset.nav === 'main' && label) label.textContent = 'Start';
    });
  }

  function enhanceTaskLists() {
    document.querySelectorAll('.list-card.task-card .task-first-step strong').forEach(label => {
      replaceText(label, 'First action', 'Start with');
    });
  }

  function applyEnhancements() {
    ensureLayoutSwitch();
    applyLayout();
    enhanceNavigation();
    enhanceMain();
    enhanceTaskLists();
  }

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyEnhancements();
    });
  });

  observer.observe(document.getElementById('viewRoot'), { childList: true, subtree: true });
  DESKTOP_QUERY.addEventListener('change', () => applyLayout());
  applyEnhancements();
})();
