(() => {
  'use strict';

  function replaceText(element, from, to) {
    if (element && element.textContent.trim() === from) element.textContent = to;
  }

  function polishMainCopy() {
    const mainTitle = document.getElementById('main-title');
    const mainScreen = mainTitle?.closest('.screen');
    if (mainScreen) mainScreen.classList.add('main-screen');

    replaceText(mainTitle, 'Main', 'Start here');
    const subtitle = mainScreen?.querySelector('.screen-title p');
    replaceText(subtitle, 'One useful next action.', 'Do one thing, then stop or continue.');

    const stateStrong = mainScreen?.querySelector('.state-strip .state-copy strong');
    const stateDetail = mainScreen?.querySelector('.state-strip .state-copy span');
    const stateButton = mainScreen?.querySelector('.state-strip button');

    if (stateStrong?.textContent.trim() === 'Recovery mode') {
      stateStrong.textContent = 'Room reset';
      if (stateDetail) stateDetail.textContent = 'Follow the reset tasks until the room works again.';
      if (stateButton) stateButton.textContent = 'See plan';
    } else if (stateStrong?.textContent.trim() === 'Maintenance mode') {
      stateStrong.textContent = 'Keep it usable';
      if (stateDetail) stateDetail.textContent = 'Choose what needs attention now. Missed days do not build up.';
      if (stateButton) stateButton.textContent = 'Check room';
    }

    const taskCard = mainScreen?.querySelector('.task-card');
    if (taskCard) {
      const stepLabel = taskCard.querySelector('.task-first-step strong');
      replaceText(stepLabel, 'First action', 'Start with');

      const title = taskCard.querySelector('h2')?.textContent.trim() || '';
      const primary = taskCard.querySelector('.primary-button');
      const secondary = taskCard.querySelector('.secondary-button');
      const note = taskCard.querySelector('.subtle-note');

      if (title === 'Take dishes to the kitchen') {
        if (primary) primary.textContent = 'Do one load';
        if (secondary) secondary.textContent = 'Remove all dishes';
        if (note) note.textContent = 'One load still counts.';
      } else {
        replaceText(primary, 'Minimum', 'Small version');
        replaceText(secondary, 'Full', 'Full task');
        replaceText(note, 'Stopping after the Minimum version counts.', 'The small version still counts.');
      }
    }

    const quickActions = mainScreen?.querySelectorAll('.quick-action') || [];
    if (quickActions[0]) {
      const strong = quickActions[0].querySelector('strong');
      const small = quickActions[0].querySelector('small');
      replaceText(strong, 'Something changed', 'Choose what needs attention');
      if (small) small.textContent = 'Dishes, rubbish, clothes, bed or floor';
    }
    if (quickActions[1]) {
      const strong = quickActions[1].querySelector('strong');
      const small = quickActions[1].querySelector('small');
      replaceText(strong, 'Choose another task', 'Browse or add tasks');
      if (small) small.textContent = 'Search the full task list';
    }
  }

  function polishTaskLists() {
    document.querySelectorAll('.list-card.task-card .task-first-step strong').forEach(label => {
      replaceText(label, 'First action', 'Start with');
    });
  }

  function applyPolish() {
    polishMainCopy();
    polishTaskLists();
  }

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyPolish();
    });
  });

  observer.observe(document.getElementById('viewRoot'), { childList: true, subtree: true });
  applyPolish();
})();
