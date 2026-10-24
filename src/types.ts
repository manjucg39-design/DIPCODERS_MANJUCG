import {
  User,
  WorkerProfile,
  ServiceCategory,
  Booking,
  Quotation,
  AdditionalWorkRequest,
  MaterialShop,
  Product,
  MaterialOrder,
  Dispute,
  Review,
  Notification,
  PlatformSettings,
  AdminAuditLog,
  BookingStatus,
  DeliveryStatus,
  UserRole,
} from '../server/schema';

export type {
  User,
  WorkerProfile,
  ServiceCategory,
  Booking,
  Quotation,
  AdditionalWorkRequest,
  MaterialShop,
  Product,
  MaterialOrder,
  Dispute,
  Review,
  Notification,
  PlatformSettings,
  AdminAuditLog,
  BookingStatus,
  DeliveryStatus,
  UserRole,
};

export interface WorkerWithDistance extends WorkerProfile {
  user: User;
  distanceKm: number;
}

export interface ServiceCardItem {
  id: string;
  name: string;
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
  trade: string;
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
