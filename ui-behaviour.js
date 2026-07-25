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

    mainTitle.textContent = 'Start';
    const subtitle = mainScreen.querySelector('.screen-title p');
    if (subtitle) subtitle.textContent = 'Pick one useful thing.';

    const taskCard = mainScreen.querySelector('.task-card');
    if (taskCard && !taskCard.dataset.focusEnhanced) {
      taskCard.dataset.focusEnhanced = 'true';
      taskCard.classList.add('focus-card');
      const heading = taskCard.querySelector('.task-heading');
      if (heading) {
        const now = document.createElement('p');
        now.className = 'now-label';
        now.textContent = 'Next task';
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
        if (secondary) secondary.textContent = 'Remove every dish';
        if (note) note.textContent = 'One load counts.';
      } else {
        if (primary) primary.textContent = 'Do the small version';
        if (secondary) secondary.textContent = 'Do the full task';
        if (note) note.textContent = 'The small version counts.';
      }
    }

    const stateStrip = mainScreen.querySelector('.state-strip');
    if (stateStrip) {
      stateStrip.classList.add('room-status-card');
      const strong = stateStrip.querySelector('.state-copy strong');
      const detail = stateStrip.querySelector('.state-copy span');
      const button = stateStrip.querySelector('button');

      if (strong?.textContent.trim().includes('Recovery') || strong?.textContent.trim().includes('Room reset')) {
        strong.textContent = 'Room reset';
        if (detail) detail.textContent = 'The ordered plan is ready when you need it.';
        if (button) button.textContent = 'Plan';
      } else if (strong?.textContent.trim().includes('Maintenance') || strong?.textContent.trim().includes('Keep the room')) {
        strong.textContent = 'Keep it usable';
        if (detail) detail.textContent = 'Choose what needs attention now. Nothing missed builds up.';
        if (button) button.textContent = 'Check';
      } else if (strong?.textContent.trim().includes('Active')) {
        strong.textContent = 'Task saved';
        if (detail) detail.textContent = 'Continue from the exact step you left.';
      }
    }

    const quickGrid = mainScreen.querySelector('.quick-grid');
    if (quickGrid && !quickGrid.dataset.choiceEnhanced) {
      quickGrid.dataset.choiceEnhanced = 'true';
      quickGrid.classList.add('choice-panel');
      const recoveryActive = Boolean(stateStrip?.classList.contains('recovery'));
      quickGrid.innerHTML = `
        <div class="choice-heading">
          <p class="eyebrow">Other ways to start</p>
        </div>
        ${makeQuickAction('run-scan', '◎', 'What needs attention?', 'Dishes, rubbish, clothes, bed, route or floor')}
        ${makeQuickAction(recoveryActive ? 'show-recovery' : 'run-scan', '↻', recoveryActive ? 'Room-reset plan' : 'Quick room check', recoveryActive ? 'Open the ordered reset tasks' : 'Find the current useful task')}
        ${makeQuickAction('choose-task', '☷', 'Tasks & categories', 'Browse, add or edit')}`;
    }
  }

  function enhanceActiveTask() {
    const activeTitle = document.getElementById('active-title');
    const activeScreen = activeTitle?.closest('.screen');
    if (!activeScreen) return;

    activeScreen.classList.add('active-screen');
    activeTitle.textContent = 'One step';

    const subtitle = activeScreen.querySelector('.screen-title p');
    if (subtitle) {
      subtitle.textContent = subtitle.textContent.includes('Minimum') ? 'Small version' : 'Full task';
    }

    const stateStrong = activeScreen.querySelector('.state-strip .state-copy strong');
    const stateDetail = activeScreen.querySelector('.state-strip .state-copy span');
    if (stateStrong) stateStrong.textContent = 'Current task';
    if (stateDetail) stateDetail.textContent = stateDetail.textContent.trim();

    const status = activeScreen.querySelector('.state-strip .status-pill');
    if (status) status.textContent = status.textContent.replace(/^Step\s+/i, '').replace(/\s+of\s+/i, ' / ');

    const stepCount = activeScreen.querySelector('.step-count');
    if (stepCount) stepCount.textContent = 'Do this';

    const done = activeScreen.querySelector('[data-action="complete-step"]');
    if (done) done.textContent = 'Done';

    const yes = activeScreen.querySelector('[data-action="loop-yes"]');
    const no = activeScreen.querySelector('[data-action="loop-no"]');
    if (yes) yes.textContent = 'Yes — finish';
    if (no) no.textContent = 'No — another load';

    const controls = activeScreen.querySelectorAll('.session-controls button');
    controls.forEach(button => {
      if (button.dataset.action === 'pause-session') button.textContent = 'Back';
      if (button.dataset.action === 'stop-session') button.textContent = 'Stop & save';
      if (button.dataset.action === 'task-advice') button.textContent = 'Help';
    });
  }

  function enhanceTasks() {
    const tasksTitle = document.getElementById('tasks-title');
    if (!tasksTitle) return;
    tasksTitle.textContent = 'Tasks & categories';
    const screen = tasksTitle.closest('.screen');
    const subtitle = screen?.querySelector('.screen-title p');
    if (subtitle) subtitle.textContent = 'Find, add or change a task.';

    screen?.querySelectorAll('.chip').forEach(chip => {
      replaceText(chip, 'Recovery', 'Room reset');
      replaceText(chip, 'Maintenance', 'Keep usable');
    });

    screen?.querySelectorAll('.list-card.task-card .task-first-step strong').forEach(label => {
      replaceText(label, 'First action', 'Start with');
    });
  }

  function enhanceNavigation() {
    document.querySelectorAll('[data-nav]').forEach(button => {
      const label = button.querySelector('span:last-child');
      if (button.dataset.nav === 'main' && label) label.textContent = 'Start';
    });
  }

  function applyEnhancements() {
    ensureLayoutSwitch();
    applyLayout();
    enhanceNavigation();
    enhanceMain();
    enhanceActiveTask();
    enhanceTasks();
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