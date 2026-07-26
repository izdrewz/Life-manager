(() => {
  'use strict';

  function setText(element, value) {
    if (element && element.textContent !== value) element.textContent = value;
  }

  function replaceText(element, from, to) {
    if (element && element.textContent.trim() === from) setText(element, to);
  }

  function setViewClass(view) {
    document.body.classList.remove('view-start', 'view-active', 'view-tasks', 'view-advice', 'view-more');
    document.body.classList.add(`view-${view}`);
  }

  function enhanceBrand() {
    setText(document.querySelector('.topbar .eyebrow'), 'one thing at a time');
    const indexLabel = document.querySelector('#openIndex span:last-child');
    if (indexLabel) setText(indexLabel, 'I’m lost');
    document.querySelector('.layout-switch')?.remove();
  }

  function makeQuickAction(action, icon, title, detail) {
    return `<button class="quick-action" type="button" data-action="${action}">
      <span class="quick-icon" aria-hidden="true">${icon}</span>
      <span><strong>${title}</strong><small>${detail}</small></span>
    </button>`;
  }

  function addGreeting(screen, title) {
    const titleWrap = title.closest('.screen-title')?.querySelector('div');
    if (!titleWrap || titleWrap.querySelector('.greeting-kicker')) return;
    const kicker = document.createElement('p');
    kicker.className = 'greeting-kicker';
    kicker.textContent = 'hello, Izzy';
    titleWrap.insertBefore(kicker, title);
  }

  function enhanceMain() {
    const mainTitle = document.getElementById('main-title');
    const mainScreen = mainTitle?.closest('.screen');
    if (!mainScreen) return false;

    setViewClass('start');
    mainScreen.classList.add('main-screen', 'start-screen');
    addGreeting(mainScreen, mainTitle);
    setText(mainTitle, 'Start here');
    setText(mainScreen.querySelector('.screen-title p:not(.greeting-kicker)'), 'One small thing is enough.');

    const taskCard = mainScreen.querySelector('.task-card');
    if (taskCard) {
      taskCard.classList.add('focus-card');
      if (!taskCard.querySelector('.task-orb')) {
        const orb = document.createElement('div');
        orb.className = 'task-orb';
        const icon = taskCard.querySelector('.category-label span')?.textContent || '✦';
        orb.textContent = icon;
        taskCard.insertBefore(orb, taskCard.firstChild);
      }
      if (!taskCard.querySelector('.now-label')) {
        const heading = taskCard.querySelector('.task-heading');
        if (heading) {
          const now = document.createElement('p');
          now.className = 'now-label';
          now.textContent = 'One small start';
          heading.parentNode.insertBefore(now, heading);
        }
      }

      replaceText(taskCard.querySelector('.task-first-step strong'), 'First action', 'Start this task');
      replaceText(taskCard.querySelector('.task-first-step strong'), 'Start with', 'Start this task');

      const title = taskCard.querySelector('h2')?.textContent.trim() || '';
      const primary = taskCard.querySelector('.primary-button');
      const secondary = taskCard.querySelector('.secondary-button');
      const note = taskCard.querySelector('.subtle-note');

      if (title === 'Take dishes to the kitchen') {
        setText(primary, 'Take one load');
        setText(secondary, 'Remove every dish');
        setText(note, 'One load is enough to count.');
      } else {
        setText(primary, 'Do one small version');
        setText(secondary, 'Do the whole task');
        setText(note, 'A small version counts.');
      }
    }

    const stateStrip = mainScreen.querySelector('.state-strip');
    if (stateStrip) {
      stateStrip.classList.add('room-status-card');
      const strong = stateStrip.querySelector('.state-copy strong');
      const detail = stateStrip.querySelector('.state-copy span');
      const button = stateStrip.querySelector('button');
      const stateName = strong?.textContent.trim() || '';

      if (stateName.includes('Recovery') || stateName.includes('Room reset')) {
        setText(strong, 'Room reset is ready');
        setText(detail, 'Open the ordered plan when you need it.');
        setText(button, 'See plan');
      } else if (stateName.includes('Maintenance') || stateName.includes('Keep it usable')) {
        setText(strong, 'Keep the room usable');
        setText(detail, 'Choose what needs attention now.');
        setText(button, 'Check');
      } else if (stateName.includes('Active') || stateName.includes('Task saved')) {
        setText(strong, 'Your task is saved');
        setText(detail, 'Continue from the exact step you left.');
        setText(button, 'Continue');
      }
    }

    const quickGrid = mainScreen.querySelector('.quick-grid');
    if (quickGrid) {
      quickGrid.classList.add('choice-panel');
      const recoveryActive = Boolean(stateStrip?.classList.contains('recovery'));
      quickGrid.innerHTML = `
        ${makeQuickAction('run-scan', '◎', 'What needs attention?', 'Pick what you can see')}
        ${makeQuickAction(recoveryActive ? 'show-recovery' : 'run-scan', '⚡', recoveryActive ? 'Room reset' : 'Quick check', recoveryActive ? 'Open the ordered plan' : 'Find one useful task')}
        ${makeQuickAction('choose-task', '☷', 'Tasks', 'Browse, add or edit')}`;
    }

    return true;
  }

  function enhanceActiveTask() {
    const activeTitle = document.getElementById('active-title');
    const activeScreen = activeTitle?.closest('.screen');
    if (!activeScreen) return false;

    setViewClass('active');
    activeScreen.classList.add('active-screen');
    setText(activeTitle, 'One thing now');

    const subtitle = activeScreen.querySelector('.screen-title p');
    if (subtitle) setText(subtitle, subtitle.textContent.includes('Minimum') ? 'Small version' : 'Full task');

    setText(activeScreen.querySelector('.state-strip .state-copy strong'), 'Current task');
    const status = activeScreen.querySelector('.state-strip .status-pill');
    if (status && /^Step\s+/i.test(status.textContent)) {
      setText(status, status.textContent.replace(/^Step\s+/i, '').replace(/\s+of\s+/i, ' / '));
    }

    setText(activeScreen.querySelector('.step-count'), 'Do this');
    setText(activeScreen.querySelector('[data-action="complete-step"]'), 'Done');
    setText(activeScreen.querySelector('[data-action="loop-yes"]'), 'Yes — finished');
    setText(activeScreen.querySelector('[data-action="loop-no"]'), 'No — another load');

    activeScreen.querySelectorAll('.session-controls button').forEach(button => {
      if (button.dataset.action === 'pause-session') setText(button, 'Back');
      if (button.dataset.action === 'stop-session') setText(button, 'Stop & save');
      if (button.dataset.action === 'task-advice') setText(button, 'Help');
    });
    return true;
  }

  function enhanceTasks() {
    const title = document.getElementById('tasks-title');
    if (!title) return false;
    setViewClass('tasks');
    setText(title, 'Tasks');
    const screen = title.closest('.screen');
    setText(screen?.querySelector('.screen-title p'), 'Find, add or change something.');
    screen?.querySelectorAll('.chip').forEach(chip => {
      replaceText(chip, 'Recovery', 'Room reset');
      replaceText(chip, 'Maintenance', 'Keep usable');
    });
    return true;
  }

  function enhanceAdvice() {
    const title = document.getElementById('advice-title') || document.getElementById('advice-detail-title');
    if (!title) return false;
    setViewClass('advice');
    return true;
  }

  function enhanceMore() {
    const title = document.getElementById('more-title');
    if (!title) return false;
    setViewClass('more');
    return true;
  }

  function enhanceNavigation() {
    document.querySelectorAll('[data-nav]').forEach(button => {
      const label = button.querySelector('span:last-child');
      if (button.dataset.nav === 'main') setText(label, 'Today');
    });
  }

  function applyEnhancements() {
    enhanceBrand();
    enhanceNavigation();
    if (enhanceMain()) return;
    if (enhanceActiveTask()) return;
    if (enhanceTasks()) return;
    if (enhanceAdvice()) return;
    enhanceMore();
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
  applyEnhancements();
})();