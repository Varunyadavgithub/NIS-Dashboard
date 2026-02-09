import { ROLES } from '../config/roles';

export const usersData = [
  {
    id: 1,
    name: 'Super Admin',
    email: 'superadmin@nehasecurity.com',
    password: 'super123',
    phone: '+91 9876543200',
    role: ROLES.SUPER_ADMIN,
    status: 'active',
    avatar: null,
    createdAt: '2023-01-01',
    lastLogin: '2024-01-15 10:30 AM',
  },
  {
    id: 2,
    name: 'Admin User',
    email: 'admin@nehasecurity.com',
    password: 'admin123',
    phone: '+91 9876543201',
    role: ROLES.ADMIN,
    status: 'active',
    avatar: null,
    createdAt: '2023-01-15',
    lastLogin: '2024-01-15 09:00 AM',
  },
  {
    id: 3,
    name: 'Rahul Manager',
    email: 'manager@nehasecurity.com',
    password: 'manager123',
    phone: '+91 9876543202',
    role: ROLES.MANAGER,
    status: 'active',
    avatar: null,
    createdAt: '2023-02-01',
    lastLogin: '2024-01-14 11:00 AM',
  },
  {
    id: 4,
    name: 'Sunil Supervisor',
    email: 'supervisor@nehasecurity.com',
    password: 'supervisor123',
    phone: '+91 9876543203',
    role: ROLES.SUPERVISOR,
    status: 'active',
    avatar: null,
    createdAt: '2023-03-01',
    lastLogin: '2024-01-15 06:00 AM',
  },
  {
    id: 5,
    name: 'Priya Staff',
    email: 'staff@nehasecurity.com',
    password: 'staff123',
    phone: '+91 9876543204',
    role: ROLES.STAFF,
    status: 'active',
    avatar: null,
    createdAt: '2023-04-01',
    lastLogin: '2024-01-15 08:00 AM',
  },
  {
    id: 6,
    name: 'Meera Accountant',
    email: 'accountant@nehasecurity.com',
    password: 'accountant123',
    phone: '+91 9876543205',
    role: ROLES.ACCOUNTANT,
    status: 'active',
    avatar: null,
    createdAt: '2023-05-01',
    lastLogin: '2024-01-14 04:00 PM',
  },
];

export const findUserByCredentials = (email, password) => {
  return usersData.find(
    user => user.email === email && user.password === password && user.status === 'active'
  );
};