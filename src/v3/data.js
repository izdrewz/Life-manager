export { DEFAULT_ADVICE, DEFAULT_CATEGORIES, ROOM_CONDITIONS, TONES } from '../data.js';
import { DEFAULT_TASKS as BASE_TASKS } from '../data.js';

export const DEFAULT_TASKS = BASE_TASKS.map((task) => task.id === 'take-dishes' ? {
  ...task,
  minimumLabel: 'Start with one load',
  minimum: 'Begin the carrier loop with one safe load. The task finishes when all bedroom dishes are removed.',
} : task);
