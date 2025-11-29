import { Role, TaskStatus, User, Task, Shift } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Sarah Conner',
    email: 'manager@test.com',
    role: Role.MANAGER,
    avatar: 'https://picsum.photos/200/200?random=1',
    level: 10,
    xp: 5000
  },
  {
    id: 'u2',
    name: 'John Doe',
    email: 'employee@test.com',
    role: Role.EMPLOYEE,
    avatar: 'https://picsum.photos/200/200?random=2',
    level: 3,
    xp: 1200
  },
  {
    id: 'u3',
    name: 'Jane Smith',
    email: 'jane@test.com',
    role: Role.EMPLOYEE,
    avatar: 'https://picsum.photos/200/200?random=3',
    level: 5,
    xp: 2400
  }
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Restock Aisle 4',
    description: 'The pasta section is running low. Please restock from inventory.',
    assignedToId: 'u2',
    status: TaskStatus.TODO,
    imageUrl: 'https://picsum.photos/600/400?random=10',
    instructions: '1. Check inventory level. 2. Bring boxes to aisle. 3. Stock using FIFO method.',
    dueDate: '2023-11-01',
    xpReward: 50
  },
  {
    id: 't2',
    title: 'Checkout Counter Setup',
    description: 'Ensure all POS systems are updated and receipt paper is full.',
    assignedToId: 'u2',
    status: TaskStatus.IN_PROGRESS,
    imageUrl: 'https://picsum.photos/600/400?random=11',
    instructions: 'Verify connection, clean screen, refill paper.',
    dueDate: '2023-11-01',
    xpReward: 30
  },
  {
    id: 't3',
    title: 'Inventory Audit',
    description: 'Count stock for the dairy section.',
    assignedToId: 'u3',
    status: TaskStatus.COMPLETED,
    imageUrl: 'https://picsum.photos/600/400?random=12',
    instructions: 'Use the scanner to log all items in the dairy fridge.',
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
    uploadedBy: 'u1'
  }
];