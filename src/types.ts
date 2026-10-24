export type ServiceCategory = 'all' | 'Plumbing' | 'Electrical' | 'Painting' | 'Cleaning' | 'Carpentry';

export interface ServiceCardItem {
  id: string;
  name: ServiceCategory;
  title: string;
  shortDesc: string;
  image: string;
  startingPrice: string;
  workerCount: number;
  popularTasks: string[];
}

export interface Worker {
  id: string;
  name: string;
  trade: 'Plumbing' | 'Electrical' | 'Painting' | 'Cleaning' | 'Carpentry';
  rating: number;
  reviewsCount: number;
  jobsCompleted: number;
  hourlyRate: number;
  neighborhood: string;
  experienceYears: number;
  responseTime: string;
  verified: boolean;
  specialties: string[];
  avatarUrl?: string;
  bio: string;
}

export interface BookingFormState {
  workerId?: string;
  workerName?: string;
  serviceCategory: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  preferredDate: string;
  urgency: 'routine' | 'today' | 'emergency';
  notes: string;
}

export interface WorkerApplicationState {
  fullName: string;
  trade: 'Plumbing' | 'Electrical' | 'Painting' | 'Cleaning' | 'Carpentry';
  phone: string;
  email: string;
  neighborhood: string;
  hourlyRate: string;
  yearsOfExperience: string;
  licensed: boolean;
}
