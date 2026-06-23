import { Timestamp } from 'firebase/firestore';
import type { Submission } from '../types/submission';

const createMockTimestamp = (date: Date): Timestamp => Timestamp.fromDate(date);

const generateSubmissionsForWorkshop = (workshopId: string, count: number): Submission[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${workshopId}_sub_${i}`,
    workshopId,
    name: `Student ${i + 1}`,
    course: ['Computer Science', 'IT', 'Electronics', 'Mechanical'][i % 4],
    phone: `987654321${i % 10}`,
    email: `student${i + 1}@example.com`,
    feedback: i % 3 === 0 ? 'Great workshop!' : i % 3 === 1 ? 'Could be better.' : 'Excellent content and delivery.',
    rating: (i % 5) + 1, // 1 to 5 stars
    phoneVerified: true,
    emailVerified: true,
    submittedAt: createMockTimestamp(new Date(Date.now() - Math.random() * 1000000000)),
    certificateStatus: i % 5 === 0 ? 'pending' : i % 5 === 4 ? 'failed' : 'sent',
    certificateUrl: i % 5 !== 0 && i % 5 !== 4 ? `https://example.com/cert_${i}.pdf` : null,
    emailStatus: i % 5 === 4 ? 'failed' : 'sent',
    whatsappStatus: i % 5 === 4 ? 'failed' : 'sent',
    deliveredAt: i % 5 !== 0 && i % 5 !== 4 ? createMockTimestamp(new Date()) : null,
    deliveryErrors: i % 5 === 4 ? ['Failed to send email'] : [],
  })) as unknown as Submission[]; // Type casting to bypass TS issues if deliveryStatus types don't exactly map
};

// Generate 45 submissions for test-123, 12 for done-789
export const mockSubmissions: Submission[] = [
  ...generateSubmissionsForWorkshop('test-123', 45),
  ...generateSubmissionsForWorkshop('done-789', 12),
  ...generateSubmissionsForWorkshop('mock-0', 25),
  ...generateSubmissionsForWorkshop('mock-3', 10),
];
