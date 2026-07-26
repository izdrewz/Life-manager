export const TONES = ['blue', 'berry', 'mauve', 'gold', 'lavender', 'slate', 'ochre', 'sage', 'coral'];

export const DEFAULT_CATEGORIES = [
  { id: 'food', label: 'Food & dishes', icon: 'utensils', tone: 'blue', locked: true },
  { id: 'waste', label: 'Rubbish & recycling', icon: 'trash', tone: 'berry', locked: true },
  { id: 'clothes', label: 'Clothes & laundry', icon: 'shirt', tone: 'mauve', locked: true },
  { id: 'function', label: 'Bed & route', icon: 'home', tone: 'gold', locked: true },
  { id: 'tidying', label: 'Surfaces & tidying', icon: 'layers', tone: 'lavender', locked: true },
  { id: 'deep', label: 'Floors & deep cleaning', icon: 'sparkles', tone: 'sage', locked: true },
  { id: 'organise', label: 'Organisation & storage', icon: 'archive', tone: 'slate', locked: true },
  { id: 'oneoff', label: 'One-off', icon: 'star', tone: 'ochre', locked: true },
];

export const DEFAULT_TASKS = [
  {
    id: 'take-dishes', title: 'Take dishes to the kitchen', category: 'food', type: 'permanent', mode: 'recovery',
    minimumLabel: 'Take one load', fullLabel: 'Remove every dish',
    minimum: 'One safe load reaches the kitchen hand-off point.',
    full: 'Repeat the carrier cycle until all bedroom dishes are removed.',
    loop: 'dishes', preserve: false,
    steps: [
      'Get the dish transport carrier and begin filling it.',
      'Take one safe load to the kitchen hand-off.',
      'Are all bedroom dishes removed?',
    ],
  },
  {
    id: 'bag-visible-mess', title: 'Bag one visible zone', category: 'tidying', type: 'permanent', mode: 'recovery',
    minimumLabel: 'Do one bag', fullLabel: 'Finish this zone',
    minimum: 'Close one filled bag or dedicated container.',
    full: 'Contain the chosen zone without opening another sorting project.',
    preserve: true,
    steps: [
      'Choose one small visible floor or surface zone and open one bag.',
      'Put loose mixed items into the bag. Route obvious dishes, cans, cardboard and dirty clothes into their dedicated containers.',
      'Close the bag or finish the chosen container before opening another.',
    ],
  },
  {
    id: 'process-one-bag', title: 'Process one mixed bag', category: 'organise', type: 'permanent', mode: 'recovery',
    minimumLabel: 'Process one bag', fullLabel: 'Finish this bag',
    minimum: 'Process one bag. Stopping after it counts.',
    full: 'Route everything in the bag into rubbish, dishes, clothing, homes or the no-home container.',
    preserve: true,
    steps: [
      'Open one bag only and remove rubbish.',
      'Move dishes to the carrier and clothing to the correct clothing container.',
      'Return items with homes. Put items without homes into the single no-home container.',
      'Close or remove this bag before opening another.',
    ],
  },
  {
    id: 'remove-rubbish', title: 'Remove the bedroom rubbish bag', category: 'waste', type: 'permanent', mode: 'maintenance',
    minimumLabel: 'Remove one bag', fullLabel: 'Replace the bag too',
    minimum: 'Remove one closed bag.', full: 'Remove the full bag and put a replacement in place.', preserve: false,
    steps: ['Close the current rubbish bag.', 'Take it to the household rubbish point.', 'Put a replacement bag or container in place.'],
  },
  {
    id: 'loose-cans', title: 'Put loose Pepsi cans into the can container', category: 'waste', type: 'permanent', mode: 'maintenance',
    minimumLabel: 'Move one can', fullLabel: 'Clear this zone',
    minimum: 'Put one loose can into the container.', full: 'Collect all loose cans in the current zone and return the container to its fixed place.', preserve: false,
    steps: ['Put the nearest loose can into the can container.', 'Collect the remaining loose cans in the current zone.', 'Return the container to its fixed place.'],
  },
  {
    id: 'dirty-clothes', title: 'Put dirty clothing into the basket', category: 'clothes', type: 'permanent', mode: 'maintenance',
    minimumLabel: 'Move one item', fullLabel: 'Clear this zone',
    minimum: 'Put one dirty item into the basket.', full: 'Collect all dirty clothing in the selected zone.', preserve: false,
    steps: ['Put the nearest dirty item into the laundry basket.', 'Collect only dirty clothing in the selected zone.', 'Leave clean clothing for a separate put-away task.'],
  },
  {
    id: 'clean-clothes', title: 'Put clean clothing away', category: 'clothes', type: 'permanent', mode: 'maintenance',
    minimumLabel: 'Put away one item', fullLabel: 'Finish this clean-clothes group',
    minimum: 'Put one clean item in its home.', full: 'Put away the selected group of clean clothing.', preserve: false,
    steps: ['Choose one small group of clean clothing.', 'Put each item into its wardrobe location.', 'Stop when this group is away.'],
  },
  {
    id: 'restore-bed', title: 'Make the bed usable', category: 'function', type: 'permanent', mode: 'recovery',
    minimumLabel: 'Make enough space', fullLabel: 'Clear the bed',
    minimum: 'Clear enough space to use the bed.', full: 'Route all blocking items until the bed is fully usable.', preserve: true,
    steps: ['Move one item that prevents the bed being used.', 'Continue only with items blocking the bed.', 'Stop when the bed can be used.'],
  },
  {
    id: 'walking-route', title: 'Clear the walking route', category: 'function', type: 'permanent', mode: 'recovery',
    minimumLabel: 'Clear one step', fullLabel: 'Clear the route',
    minimum: 'Clear one additional step of the route.', full: 'Create one continuous clear route through the bedroom.', preserve: true,
    steps: ['Move the nearest obstruction into its correct container or home.', 'Continue only along the main route.', 'Stop when the route is continuous and usable.'],
  },
  {
    id: 'vacuum-zone', title: 'Vacuum one dry floor zone', category: 'deep', type: 'permanent', mode: 'maintenance',
    minimumLabel: 'Vacuum one patch', fullLabel: 'Vacuum this zone',
    minimum: 'Vacuum one small dry patch or the main route.', full: 'Vacuum the selected dry zone without expanding into another zone.', preserve: true,
    steps: ['Choose one dry accessible zone.', 'Bring the vacuum and suitable attachment.', 'Vacuum only the selected zone and stop.'],
  },
  {
    id: 'wet-carpet', title: 'Deal with the wet carpet around the dehumidifier', category: 'oneoff', type: 'oneoff', mode: 'recovery',
    minimumLabel: 'Record the next action', fullLabel: 'Resolve the issue',
    minimum: 'Keep the area excluded and record the next action.', full: 'Resolve the temporary wet-carpet task and close it.', preserve: false,
    steps: ['Keep the wet patch excluded from ordinary floor tasks.', 'Follow the separate wet-carpet plan.', 'Close this one-off task when the temporary issue is resolved.'],
  },
];

export const DEFAULT_ADVICE = [
  {
    id: 'five-things', title: 'Five Things method', type: 'Book guidance',
    summary: 'Sort visible mess into rubbish, dishes, clothing, items with homes and items without homes.',
    body: [
      'Use five visible categories: rubbish, dishes, clothing, items with homes and items without homes.',
      'In Life Manager, this method is used inside one small zone or one bag at a time rather than across the whole room at once.',
      'Items without homes go into the single no-home container so they do not become a new sorting project.',
    ],
  },
  {
    id: 'one-bag', title: 'One bag only', type: 'My method',
    summary: 'Open one bag, finish what is possible, then close or remove it before opening another.',
    body: [
      'Only one mixed bag is active at a time.',
      'Remove rubbish first, then route dishes, clothing, items with homes and items without homes.',
      'Close or remove the current bag before opening another. Stopping after one processed bag counts.',
    ],
  },
  {
    id: 'minimum-counts', title: 'The smaller version counts', type: 'My rule',
    summary: 'The smaller version is a valid completion, not a failed full version.',
    body: [
      'Choose the smaller version when that is the useful level for the session.',
      'It does not create catch-up debt and it is recorded as a completion.',
      'You may continue after completing it, but continuing is optional.',
    ],
  },
  {
    id: 'preserve-first', title: 'Protect before moving', type: 'My rule',
    summary: 'Before disruptive work, protect anything fragile, meaningful, location-sensitive or unsafe to move.',
    body: [
      'The preservation check appears before tasks that could disturb a pile, surface, bed, route or floor zone.',
      'Move protected items to a named safe place before the cleaning steps begin.',
      'Do not treat uncertain or wet areas as ordinary floor-cleaning tasks.',
    ],
  },
];

export const ROOM_CONDITIONS = [
  { id: 'dishes', label: 'Dishes or cups are in the bedroom', taskId: 'take-dishes', tone: 'blue' },
  { id: 'rubbish', label: 'A rubbish bag or loose cans need moving', taskId: 'remove-rubbish', tone: 'berry' },
  { id: 'clothes', label: 'Dirty clothes are loose', taskId: 'dirty-clothes', tone: 'mauve' },
  { id: 'bed', label: 'The bed is not usable', taskId: 'restore-bed', tone: 'gold' },
  { id: 'route', label: 'The walking route is blocked', taskId: 'walking-route', tone: 'gold' },
  { id: 'mess', label: 'There is a visible mixed-mess zone', taskId: 'bag-visible-mess', tone: 'lavender' },
  { id: 'bag', label: 'A mixed bag needs processing', taskId: 'process-one-bag', tone: 'slate' },
  { id: 'floor', label: 'A dry floor zone needs vacuuming', taskId: 'vacuum-zone', tone: 'sage' },
];

export const PRESERVATION_OPTIONS = [
  'Photos, papers or keepsakes',
  'Fragile items',
  'Electronics, chargers or cables',
  'Items whose exact location matters',
  'Something wet, unsafe or uncertain',
];
