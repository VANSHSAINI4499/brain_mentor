import { Timestamp } from 'firebase/firestore';
import type { Workshop } from '../types/workshop';

const createMockTimestamp = (date: Date): Timestamp => Timestamp.fromDate(date);

export const mockWorkshops: Workshop[] = [
  {
    id: 'test-123',
    collegeName: 'Demo Engineering College',
    workshopName: 'React & Firebase Masterclass',
    dateTime: createMockTimestamp(new Date('2026-07-01T10:00:00Z')),
    instructions: 'Please bring your laptops installed with Node.js',
    status: 'active',
    formLink: 'test-123',
    createdBy: 'mock-admin-123',
    createdAt: createMockTimestamp(new Date('2026-06-20T10:00:00Z')),
    updatedAt: createMockTimestamp(new Date('2026-06-20T10:00:00Z')),
    certificateTemplateId: null,
  },
  {
    id: 'draft-456',
    collegeName: 'State University',
    workshopName: 'Intro to Cloud Computing',
    dateTime: createMockTimestamp(new Date('2026-08-15T09:00:00Z')),
    instructions: 'No prerequisites.',
    status: 'draft',
    formLink: null,
    createdBy: 'mock-admin-123',
    createdAt: createMockTimestamp(new Date('2026-06-21T10:00:00Z')),
    updatedAt: createMockTimestamp(new Date('2026-06-21T10:00:00Z')),
    certificateTemplateId: null,
  },
  {
    id: 'done-789',
    collegeName: 'Tech Institute',
    workshopName: 'Advanced UI/UX',
    dateTime: createMockTimestamp(new Date('2026-05-10T14:00:00Z')),
    instructions: 'Figma required.',
    status: 'inactive',
    formLink: 'done-789',
    createdBy: 'mock-admin-123',
    createdAt: createMockTimestamp(new Date('2026-05-01T10:00:00Z')),
    updatedAt: createMockTimestamp(new Date('2026-05-11T10:00:00Z')),
    certificateTemplateId: null,
  },
  ...Array.from({ length: 7 }).map((_, i) => ({
    id: `mock-${i}`,
    collegeName: `College ${i + 1}`,
    workshopName: `Workshop ${i + 1}`,
    dateTime: createMockTimestamp(new Date(2026, 6 + (i % 3), i + 1)),
    instructions: 'Default instructions',
    status: (i % 3 === 0 ? 'active' : i % 3 === 1 ? 'draft' : 'inactive') as 'active' | 'draft' | 'inactive',
    formLink: i % 3 !== 1 ? `mock-link-${i}` : null,
    createdBy: 'mock-admin-123',
    createdAt: createMockTimestamp(new Date()),
    updatedAt: createMockTimestamp(new Date()),
    certificateTemplateId: null,
  }))
];
