import { Role, TaskStatus, User, Task, Shift } from './types';

export const STANDARD_TASKS = [
  "DEPARTMENT WALK", "PICKLIST", "CYCLE COUNT", "BACKFILLING ENCAPS",
  "BACKFILLING BUNKER TOPS", "BACKFILLING PROFIT PANELS", "BACKFILLING BINS",
  "BACKFILLING DISPLAYS", "BACKFILLING LANDINI RACK", "BACKFILLING 4 FACING RACK",
  "REDUCTION RACK", "DMAP EXECUTION", "DMAP FOLLOW UP", "DEPARTMENT RESET",
  "WORK ON CHIPS + RACKS", "WORK ON OVP", "WORK ON PROMO UBOATS",
  "WORK ON OVERSTOCK UBOAT", "WORK ON BEER", "WORK ON NEW ORDER",
  "WORK ON COLD VAULT", "WORK ON CHECKOUT ENDCAPS", "WORK ON WATER",
  "ORDER OPPORTUNITIES", "ORDER BEER", "ORDER COLD VAULT",
  "CHECK EXPIRED ITEMS", "TEAM TRAINING", "ORGANIZE BACKROOM/TRAILER",
  "LOOK FOR IMPROVEMENT OPPORTUNITIES", "WORK ON OLDER DATED SKIDS",
  "MANAGERS MEETING", "ADCUTS", "DOCUMENTS RESET", "PICKLIST INVERTED",
  "COUNTS ADJUSTMENT", "SCHEDULE", "ACADEMY COURSES", "FLYER CHECK",
  "Fill up crackers", "DEPARTMENT DOC WALL", "KOSHER SKID", "WRITE NIGHT CREW TASKS"
];

const DEFAULT_PASSWORD = 'grocery';

export const MOCK_USERS: User[] = [
  // Managers
  {
    id: 'm1',
    name: 'Lamec',
    username: 'lamec.zehrs',
    email: 'lamec.zehrs@store.com',
    password: DEFAULT_PASSWORD,
    role: Role.MANAGER,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lamec',
    level: 20,
    xp: 15000
  },
  {
    id: 'm2',
    name: 'Divya',
    username: 'divya.zehrs',
    email: 'divya.zehrs@store.com',
    password: DEFAULT_PASSWORD,
    role: Role.MANAGER,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Divya',
    level: 18,
    xp: 12500
  },
  // Team
  {
    id: 'e1',
    name: 'Jason',
    username: 'jason.zehrs',
    email: 'jason.zehrs@store.com',
    password: DEFAULT_PASSWORD,
    role: Role.EMPLOYEE,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jason',
    level: 5,
    xp: 2400
  },
  {
    id: 'e2',
    name: 'Victoria',
    username: 'victoria.zehrs',
    email: 'victoria.zehrs@store.com',
    password: DEFAULT_PASSWORD,
    role: Role.EMPLOYEE,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Victoria',
    level: 6,
    xp: 3100
  },
  {
    id: 'e3',
    name: 'Eldhose',
    username: 'eldhose.zehrs',
    email: 'eldhose.zehrs@store.com',
    password: DEFAULT_PASSWORD,
    role: Role.EMPLOYEE,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eldhose',
    level: 4,
    xp: 1800
  },
  {
    id: 'e4',
    name: 'Pavan',
    username: 'pavan.zehrs',
    email: 'pavan.zehrs@store.com',
    password: DEFAULT_PASSWORD,
    role: Role.EMPLOYEE,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pavan',
    level: 3,
    xp: 1200
  }
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'DEPARTMENT WALK',
    description: 'Perform standard morning walk.',
    assignedToId: 'e1',
    status: TaskStatus.TODO,
    imageUrl: 'https://picsum.photos/600/400?random=10',
    instructions: 'Check for safety hazards, cleanliness, and stocking levels.',
    dueDate: '2023-11-01',
    xpReward: 50
  },
  {
    id: 't2',
    title: 'WORK ON BEER',
    description: 'Restock the beer cooler and organize backstock.',
    assignedToId: 'e2',
    status: TaskStatus.IN_PROGRESS,
    imageUrl: 'https://picsum.photos/600/400?random=11',
    instructions: 'Ensure FIFO rotation.',
    dueDate: '2023-11-01',
    xpReward: 30
  },
  {
    id: 't3',
    title: 'CYCLE COUNT',
    description: 'Verify inventory counts for dairy section.',
    assignedToId: 'e3',
    status: TaskStatus.COMPLETED,
    imageUrl: 'https://picsum.photos/600/400?random=12',
    instructions: 'Use the scanner to log all items.',
    dueDate: '2023-10-29',
    xpReward: 100
  }
];

export const MOCK_SHIFTS: Shift[] = [
  {
    id: 's1',
    title: 'November Week 1 Schedule',
    date: '2023-11-01',
    fileName: 'schedule_nov_w1.pdf',
    fileUrl: '#',
    uploadedBy: 'm1'
  }
];