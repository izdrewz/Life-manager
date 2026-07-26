import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const failures = [];
const requireText = (path, text, label) => {
  if (!read(path).includes(text)) failures.push(`${label} is missing from ${path}`);
};
const forbidText = (path, text, label) => {
  if (read(path).includes(text)) failures.push(`${label} must not appear in ${path}`);
};

requireText('src/main.jsx', "import App from './v3/App.jsx';", 'v3 application entry point');
requireText('src/data.js', 'Get the dish transport carrier and begin filling it.', 'dish instruction 1');
requireText('src/data.js', 'Take one safe load to the kitchen hand-off.', 'dish instruction 2');
requireText('src/data.js', 'Are all bedroom dishes removed?', 'dish completion question');
requireText('src/v3/store.js', "stepIndex: 0, cycles: state.session.cycles + 1", 'No-answer dish repeat');
forbidText('src/v3/active-screen.jsx', 'One load is done. Stopping here counts.', 'withdrawn one-load stopping branch');
requireText('src/v3/active-screen.jsx', 'Do you need to preserve anything for an upcoming event or day?', 'approved protection question');
requireText('src/v3/main-screen.jsx', 'Continue where you left off.', 'active-session priority wording');
requireText('src/v3/index-modals.jsx', 'I need to revise locked rule [RULE ID].', 'locked-rule ChatGPT prompt');
requireText('src/v3/index-modals.jsx', 'Preserve the approved blueprint and give an exact proposed fix with no unrelated changes.', 'bug-report ChatGPT prompt');

if (failures.length) {
  console.error('Locked-rule verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Locked-rule verification passed.');
