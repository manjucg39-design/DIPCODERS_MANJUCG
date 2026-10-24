import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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
} from './schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '..', 'data', 'localfix-db.json');

import { MYSURU_LOCALITIES, calculateHaversineDistance } from '../src/constants/mysuru';
export { MYSURU_LOCALITIES, calculateHaversineDistance };

export interface DatabaseState {
  users: User[];
  workerProfiles: WorkerProfile[];
  categories: ServiceCategory[];
  bookings: Booking[];
  quotations: Quotation[];
  additionalWorkRequests: AdditionalWorkRequest[];
  materialShops: MaterialShop[];
  products: Product[];
  materialOrders: MaterialOrder[];
  disputes: Dispute[];
  reviews: Review[];
  notifications: Notification[];
  platformSettings: PlatformSettings;
  auditLogs: AdminAuditLog[];
}

function getInitialSeed(): DatabaseState {
  const users: User[] = [
    // Customers
    { id: 'c-1', name: 'Kavitha S.', email: 'kavitha@example.com', phone: '9845012345', password: 'password123', role: 'customer', language: 'kn', addressLocality: 'Gokulam', createdAt: '2026-10-01T10:00:00Z' },
    { id: 'c-2', name: 'Rajesh Rao', email: 'rajesh@example.com', phone: '9845023456', password: 'password123', role: 'customer', language: 'en', addressLocality: 'Vijayanagar', createdAt: '2026-10-02T11:00:00Z' },
    { id: 'c-3', name: 'Ananya Gowda', email: 'ananya@example.com', phone: '9845034567', password: 'password123', role: 'customer', language: 'kn', addressLocality: 'Kuvempunagar', createdAt: '2026-10-03T12:00:00Z' },
    { id: 'c-4', name: 'Vikram Patel', email: 'vikram@example.com', phone: '9845045678', password: 'password123', role: 'customer', language: 'hi', addressLocality: 'Saraswathipuram', createdAt: '2026-10-04T13:00:00Z' },

    // Workers
    { id: 'w-1', name: 'Basavaraju M.', email: 'basav@example.com', phone: '9845111222', password: 'password123', role: 'worker', language: 'kn', addressLocality: 'Gokulam', createdAt: '2026-09-10T09:00:00Z' },
    { id: 'w-2', name: 'Manjunath Swamy', email: 'manju.tech@example.com', phone: '9845222333', password: 'password123', role: 'worker', language: 'kn', addressLocality: 'Vijayanagar', createdAt: '2026-09-12T09:00:00Z' },
    { id: 'w-3', name: 'Suresh Kumar', email: 'suresh.paint@example.com', phone: '9845333444', password: 'password123', role: 'worker', language: 'kn', addressLocality: 'Kuvempunagar', createdAt: '2026-09-15T09:00:00Z' },
    { id: 'w-4', name: 'Anand Prasad', email: 'anand.carpenter@example.com', phone: '9845444555', password: 'password123', role: 'worker', language: 'en', addressLocality: 'Saraswathipuram', createdAt: '2026-09-18T09:00:00Z' },
    { id: 'w-5', name: 'Prema Devi', email: 'prema.clean@example.com', phone: '9845555666', password: 'password123', role: 'worker', language: 'kn', addressLocality: 'Jayalakshmipuram', createdAt: '2026-09-20T09:00:00Z' },
    { id: 'w-6', name: 'Chethan Gowda', email: 'chethan.ac@example.com', phone: '9845666777', password: 'password123', role: 'worker', language: 'kn', addressLocality: 'Hebbal', createdAt: '2026-09-22T09:00:00Z' },

    // Shop Owners
    { id: 's-owner-1', name: 'Nagaraj Shenoy', email: 'mysuru.hardware@example.com', phone: '9845777888', password: 'password123', role: 'shop', language: 'kn', addressLocality: 'Kuvempunagar', createdAt: '2026-09-01T08:00:00Z' },
    { id: 's-owner-2', name: 'Ramesh Hegde', email: 'gokulam.pipes@example.com', phone: '9845888999', password: 'password123', role: 'shop', language: 'kn', addressLocality: 'Gokulam', createdAt: '2026-09-02T08:00:00Z' },

    // Delivery Partner
    { id: 'del-1', name: 'Sunil D. (Mysuru Express Delivery)', email: 'sunil.del@example.com', phone: '9845999000', password: 'password123', role: 'delivery', language: 'kn', addressLocality: 'Kuvempunagar', createdAt: '2026-09-05T08:00:00Z' },

    // Administrator
    { id: 'admin-1', name: 'Admin Dept - Mysuru LocalFix', email: 'admin@localfix.in', phone: '08212456789', password: 'password123', role: 'admin', language: 'en', addressLocality: 'Saraswathipuram', createdAt: '2026-08-01T08:00:00Z' },
  ];

  const workerProfiles: WorkerProfile[] = [
    {
      workerId: 'w-1',
      primaryTrade: 'Plumbing',
      secondaryTrades: ['General Maintenance'],
      experienceYears: 12,
      hourlyBaseRate: 350,
      minInspectionFee: 150,
      serviceAreas: ['Gokulam', 'Vijayanagar', 'Vontikoppal', 'Jayalakshmipuram'],
      currentLocality: 'Gokulam',
      lat: MYSURU_LOCALITIES['Gokulam'].lat,
      lng: MYSURU_LOCALITIES['Gokulam'].lng,
      isAvailable: true,
      isVerified: true,
      verificationStatus: 'VERIFIED',
      idType: 'Aadhaar (Sample)',
      sampleDocumentRef: 'DOC-MYS-7782-VERIFIED',
      rating: 4.9,
      totalReviews: 84,
      completedJobs: 180,
      languagesSpoken: ['Kannada', 'English'],
      bio: 'Expert residential and apartment plumber in Mysuru. Specialized in concealed pipe leaks, bathroom fixtures, and emergency tank repairs.',
    },
    {
      workerId: 'w-2',
      primaryTrade: 'Electrical Services',
      secondaryTrades: ['Appliance Repair'],
      experienceYears: 9,
      hourlyBaseRate: 400,
      minInspectionFee: 200,
      serviceAreas: ['Vijayanagar', 'Gokulam', 'Hebbal', 'Saraswathipuram'],
      currentLocality: 'Vijayanagar',
      lat: MYSURU_LOCALITIES['Vijayanagar'].lat,
      lng: MYSURU_LOCALITIES['Vijayanagar'].lng,
      isAvailable: true,
      isVerified: true,
      verificationStatus: 'VERIFIED',
      idType: 'Trade Cert (Sample)',
      sampleDocumentRef: 'CERT-MYS-ELEC-4412',
      rating: 4.95,
      totalReviews: 112,
      completedJobs: 240,
      languagesSpoken: ['Kannada', 'Hindi', 'English'],
      bio: 'Licensed wireman with 9 years of domestic wiring, MCB distribution board troubleshooting, and invertor/solar installations.',
    },
    {
      workerId: 'w-3',
      primaryTrade: 'Painting',
      secondaryTrades: ['General Maintenance'],
      experienceYears: 8,
      hourlyBaseRate: 300,
      minInspectionFee: 100,
      serviceAreas: ['Kuvempunagar', 'Saraswathipuram', 'Chamundipuram', 'Dattagalli'],
      currentLocality: 'Kuvempunagar',
      lat: MYSURU_LOCALITIES['Kuvempunagar'].lat,
      lng: MYSURU_LOCALITIES['Kuvempunagar'].lng,
      isAvailable: true,
      isVerified: true,
      verificationStatus: 'VERIFIED',
      idType: 'Voter ID (Sample)',
      sampleDocumentRef: 'VOTER-KA-MYS-9921',
      rating: 4.85,
      totalReviews: 62,
      completedJobs: 120,
      languagesSpoken: ['Kannada', 'Tamil'],
      bio: 'Interior and exterior painting specialist. High precision roller finishes, waterproofing sealants, and moisture treatment.',
    },
    {
      workerId: 'w-4',
      primaryTrade: 'Carpentry',
      secondaryTrades: ['General Maintenance'],
      experienceYears: 14,
      hourlyBaseRate: 450,
      minInspectionFee: 200,
      serviceAreas: ['Saraswathipuram', 'Kuvempunagar', 'Jayalakshmipuram', 'Nazarbad'],
      currentLocality: 'Saraswathipuram',
      lat: MYSURU_LOCALITIES['Saraswathipuram'].lat,
      lng: MYSURU_LOCALITIES['Saraswathipuram'].lng,
      isAvailable: true,
      isVerified: false,
      verificationStatus: 'PENDING',
      idType: 'Aadhaar (Sample)',
      sampleDocumentRef: 'DOC-MYS-NEW-APPLICANT',
      rating: 4.88,
      totalReviews: 45,
      completedJobs: 95,
      languagesSpoken: ['Kannada', 'Telugu', 'English'],
      bio: 'Bespoke teak and plywood carpentry, modular kitchen hinge adjustments, lock replacements, and custom shelves.',
    },
    {
      workerId: 'w-5',
      primaryTrade: 'Cleaning & Housekeeping',
      secondaryTrades: ['Cooking & Household Assistance'],
      experienceYears: 6,
      hourlyBaseRate: 250,
      minInspectionFee: 100,
      serviceAreas: ['Jayalakshmipuram', 'Gokulam', 'Vontikoppal', 'Vijayanagar'],
      currentLocality: 'Jayalakshmipuram',
      lat: MYSURU_LOCALITIES['Jayalakshmipuram'].lat,
      lng: MYSURU_LOCALITIES['Jayalakshmipuram'].lng,
      isAvailable: true,
      isVerified: true,
      verificationStatus: 'VERIFIED',
      idType: 'Aadhaar (Sample)',
      sampleDocumentRef: 'DOC-MYS-CLEAN-5531',
      rating: 4.92,
      totalReviews: 130,
      completedJobs: 310,
      languagesSpoken: ['Kannada', 'Hindi'],
      bio: 'Eco-friendly deep cleaning for villas and apartments. Kitchen de-greasing, bathroom descaling, and pre-move-in sanitization.',
    },
    {
      workerId: 'w-6',
      primaryTrade: 'AC Installation & Repair',
      secondaryTrades: ['Appliance Repair', 'Electrical Services'],
      experienceYears: 10,
      hourlyBaseRate: 500,
      minInspectionFee: 250,
      serviceAreas: ['Hebbal', 'Vijayanagar', 'Bannimantap', 'Gokulam'],
      currentLocality: 'Hebbal',
      lat: MYSURU_LOCALITIES['Hebbal'].lat,
      lng: MYSURU_LOCALITIES['Hebbal'].lng,
      isAvailable: true,
      isVerified: true,
      verificationStatus: 'VERIFIED',
      idType: 'Trade Cert (Sample)',
      sampleDocumentRef: 'CERT-HVAC-MYS-8821',
      rating: 4.91,
      totalReviews: 76,
      completedJobs: 160,
      languagesSpoken: ['Kannada', 'English'],
      bio: 'Certified split and inverter AC technician. Gas recharging, copper pipe flare repairs, filter maintenance, and PCB diagnosis.',
    },
  ];

  const categories: ServiceCategory[] = [
    { id: 'cat-1', key: 'plumbing', name: 'Plumbing Services', icon: 'Wrench', baseInspectionFee: 150, active: true, description: 'Leak repairs, tap fittings, PVC drain lines, geyser water connections' },
    { id: 'cat-2', key: 'electrical', name: 'Electrical Services', icon: 'Zap', baseInspectionFee: 200, active: true, description: 'Short-circuit fixing, MCB tripping, switch replacements, fan mounting' },
    { id: 'cat-3', key: 'painting', name: 'Painting & Waterproofing', icon: 'Paintbrush', baseInspectionFee: 100, active: true, description: 'Interior walls, putty touchups, exterior weather-guard, waterproofing' },
    { id: 'cat-4', key: 'cleaning', name: 'Housekeeping & Deep Cleaning', icon: 'Sparkles', baseInspectionFee: 100, active: true, description: 'Apartment deep clean, kitchen descaling, bathroom scrubbing, floor buffing' },
    { id: 'cat-5', key: 'carpentry', name: 'Carpentry & Woodwork', icon: 'Hammer', baseInspectionFee: 200, active: true, description: 'Door alignment, lock installation, cabinet repair, custom shelving' },
    { id: 'cat-6', key: 'appliance', name: 'Appliance Repair', icon: 'Cpu', baseInspectionFee: 200, active: true, description: 'Washing machines, microwave ovens, water purifiers, refrigerators' },
    { id: 'cat-7', key: 'ac', name: 'AC Installation & Repair', icon: 'Wind', baseInspectionFee: 250, active: true, description: 'Filter cleaning, refrigerant topup, outdoor unit servicing, bracket install' },
    { id: 'cat-8', key: 'cooking', name: 'Cooking & Home Assistance', icon: 'Utensils', baseInspectionFee: 100, active: true, description: 'South Indian & North Indian daily household meals, event assistance' },
    { id: 'cat-9', key: 'maintenance', name: 'General Maintenance', icon: 'Tool', baseInspectionFee: 150, active: true, description: 'Drilling, curtain rod installation, mirror hanging, minor fixups' },
  ];

  const materialShops: MaterialShop[] = [
    {
      id: 'shop-1',
      name: 'Mysuru Central Hardware & Pipes',
      ownerId: 's-owner-1',
      locality: 'Kuvempunagar',
      address: 'Shop 14, 5th Cross, Near Complex, Kuvempunagar, Mysuru',
      phone: '0821-2541122',
      lat: MYSURU_LOCALITIES['Kuvempunagar'].lat,
      lng: MYSURU_LOCALITIES['Kuvempunagar'].lng,
      operatingHours: '08:30 AM - 09:00 PM',
      commissionRatePercent: 5,
      isVerified: true,
      rating: 4.8,
    },
    {
      id: 'shop-2',
      name: 'Gokulam Electricals & Sanitary Supplies',
      ownerId: 's-owner-2',
      locality: 'Gokulam',
      address: '12 Temple Road, 3rd Stage, Gokulam, Mysuru',
      phone: '0821-2512233',
      lat: MYSURU_LOCALITIES['Gokulam'].lat,
      lng: MYSURU_LOCALITIES['Gokulam'].lng,
      operatingHours: '08:00 AM - 09:30 PM',
      commissionRatePercent: 5,
      isVerified: true,
      rating: 4.9,
    },
    {
      id: 'shop-3',
      name: 'Chamundi Timber, Paints & Tools',
      ownerId: 's-owner-1',
      locality: 'Vijayanagar',
      address: 'Plot 45, Ring Road Junction, Vijayanagar 2nd Stage, Mysuru',
      phone: '0821-2415566',
      lat: MYSURU_LOCALITIES['Vijayanagar'].lat,
      lng: MYSURU_LOCALITIES['Vijayanagar'].lng,
      operatingHours: '09:00 AM - 08:30 PM',
      commissionRatePercent: 5,
      isVerified: true,
      rating: 4.7,
    },
  ];

  const products: Product[] = [
    // Plumbing
    { id: 'p-1', shopId: 'shop-2', shopName: 'Gokulam Electricals & Sanitary Supplies', category: 'Plumbing', name: 'CPVC 1-inch Pipe (10 ft, Finolex)', description: 'Heavy duty pressure CPVC pipe for potable hot/cold water', unit: 'piece', unitPrice: 280, inStock: true, stockQuantity: 45, deliveryMinutesEst: 15 },
    { id: 'p-2', shopId: 'shop-2', shopName: 'Gokulam Electricals & Sanitary Supplies', category: 'Plumbing', name: 'Brass Angle Valve 1/2 inch', description: 'Quarter turn chrome-plated brass shutoff valve for geysers/toilets', unit: 'piece', unitPrice: 195, inStock: true, stockQuantity: 30, deliveryMinutesEst: 15 },
    { id: 'p-3', shopId: 'shop-1', shopName: 'Mysuru Central Hardware & Pipes', category: 'Plumbing', name: 'Teflon Sealing Tape (Pack of 3)', description: 'High density PTFE thread seal tape for leak-proof pipe joints', unit: 'pack', unitPrice: 60, inStock: true, stockQuantity: 120, deliveryMinutesEst: 12 },
    { id: 'p-4', shopId: 'shop-1', shopName: 'Mysuru Central Hardware & Pipes', category: 'Plumbing', name: 'Flexible SS Braided Water Hose (45cm)', description: 'Stainless steel braided connector pipe with brass hex nuts', unit: 'piece', unitPrice: 140, inStock: true, stockQuantity: 50, deliveryMinutesEst: 12 },
    { id: 'p-5', shopId: 'shop-2', shopName: 'Gokulam Electricals & Sanitary Supplies', category: 'Plumbing', name: 'PVC Solvent Cement (100ml Tin)', description: 'Quick-setting adhesive for PVC pipe joints and elbows', unit: 'tin', unitPrice: 85, inStock: true, stockQuantity: 60, deliveryMinutesEst: 15 },

    // Electrical
    { id: 'e-1', shopId: 'shop-2', shopName: 'Gokulam Electricals & Sanitary Supplies', category: 'Electrical', name: 'Anchor Roma 16A Modular Socket', description: 'Child-proof shuttered 3-pin modular socket with indicator', unit: 'piece', unitPrice: 125, inStock: true, stockQuantity: 80, deliveryMinutesEst: 15 },
    { id: 'e-2', shopId: 'shop-2', shopName: 'Gokulam Electricals & Sanitary Supplies', category: 'Electrical', name: 'Havells 2.5 sq mm FR Copper Wire (10m cut)', description: 'Fire retardant grade multi-strand copper house wiring cable', unit: 'bundle', unitPrice: 320, inStock: true, stockQuantity: 35, deliveryMinutesEst: 15 },
    { id: 'e-3', shopId: 'shop-2', shopName: 'Gokulam Electricals & Sanitary Supplies', category: 'Electrical', name: 'Schneider 32A Double Pole MCB', description: 'C-curve miniature circuit breaker for main distribution box', unit: 'piece', unitPrice: 390, inStock: true, stockQuantity: 25, deliveryMinutesEst: 15 },
    { id: 'e-4', shopId: 'shop-1', shopName: 'Mysuru Central Hardware & Pipes', category: 'Electrical', name: 'Insulation Electrical PVC Tape (Roll)', description: 'Steelgrip flame-retardant insulating tape', unit: 'roll', unitPrice: 20, inStock: true, stockQuantity: 200, deliveryMinutesEst: 12 },

    // Painting
    { id: 'pt-1', shopId: 'shop-3', shopName: 'Chamundi Timber, Paints & Tools', category: 'Painting', name: 'Asian Paints Apex Exterior White (4L)', description: 'Weatherproof emulsion paint with anti-fungal silicon additives', unit: 'bucket', unitPrice: 1150, inStock: true, stockQuantity: 18, deliveryMinutesEst: 18 },
    { id: 'pt-2', shopId: 'shop-3', shopName: 'Chamundi Timber, Paints & Tools', category: 'Painting', name: '9-inch Wool Roller with Extension Handle', description: 'Smooth wall micro-fiber paint roller', unit: 'piece', unitPrice: 160, inStock: true, stockQuantity: 40, deliveryMinutesEst: 18 },
    { id: 'pt-3', shopId: 'shop-3', shopName: 'Chamundi Timber, Paints & Tools', category: 'Painting', name: 'Waterproof Wall Putty (5kg Bag, Birla)', description: 'Polymer-based white cement putty for skimming uneven plaster', unit: 'bag', unitPrice: 180, inStock: true, stockQuantity: 30, deliveryMinutesEst: 18 },
    { id: 'pt-4', shopId: 'shop-1', shopName: 'Mysuru Central Hardware & Pipes', category: 'Painting', name: 'Paper Masking Tape (2-inch, 20m)', description: 'Residue-free painter masking tape for sharp border edges', unit: 'roll', unitPrice: 75, inStock: true, stockQuantity: 90, deliveryMinutesEst: 12 },

    // Carpentry
    { id: 'cp-1', shopId: 'shop-3', shopName: 'Chamundi Timber, Paints & Tools', category: 'Carpentry', name: 'Stainless Steel Auto-Close Hinges (Pair)', description: 'Concealed hydraulic soft-close cabinet hinges', unit: 'pair', unitPrice: 180, inStock: true, stockQuantity: 50, deliveryMinutesEst: 18 },
    { id: 'cp-2', shopId: 'shop-1', shopName: 'Mysuru Central Hardware & Pipes', category: 'Carpentry', name: 'Drywall & Wood Screws Assorted (Box of 100)', description: 'Zinc-coated countersunk head Phillips screws', unit: 'box', unitPrice: 120, inStock: true, stockQuantity: 70, deliveryMinutesEst: 12 },
    { id: 'cp-3', shopId: 'shop-3', shopName: 'Chamundi Timber, Paints & Tools', category: 'Carpentry', name: 'Fevicol SH Wood Adhesive (500g)', description: 'High bonding strength synthetic resin adhesive', unit: 'bottle', unitPrice: 145, inStock: true, stockQuantity: 40, deliveryMinutesEst: 18 },

    // Appliance
    { id: 'ap-1', shopId: 'shop-2', shopName: 'Gokulam Electricals & Sanitary Supplies', category: 'Appliance', name: 'Washing Machine Universal Drain Hose (2m)', description: 'Flexible corrugated discharge pipe with clamp', unit: 'piece', unitPrice: 130, inStock: true, stockQuantity: 30, deliveryMinutesEst: 15 },
    { id: 'ap-2', shopId: 'shop-2', shopName: 'Gokulam Electricals & Sanitary Supplies', category: 'Appliance', name: 'Microwave High-Voltage Fuse (0.75A 5kV)', description: 'Universal replacement cartridge fuse for convection ovens', unit: 'piece', unitPrice: 90, inStock: true, stockQuantity: 20, deliveryMinutesEst: 15 },
  ];

  const bookings: Booking[] = [
    {
      id: 'b-101',
      bookingNumber: 'LF-26-8910',
      customerId: 'c-1',
      customerName: 'Kavitha S.',
      customerPhone: '9845012345',
      workerId: 'w-1',
      workerName: 'Basavaraju M.',
      trade: 'Plumbing',
      serviceCategory: 'Plumbing Services',
      description: 'Major concealed water leakage behind the kitchen sink wall. Needs urgent inspection and pipe repair.',
      address: 'House #42, 6th Main, Gokulam 3rd Stage',
      locality: 'Gokulam',
      customerLat: MYSURU_LOCALITIES['Gokulam'].lat,
      customerLng: MYSURU_LOCALITIES['Gokulam'].lng,
      distanceKm: 0.8,
      requestedDate: '2026-10-24',
      requestedTimeSlot: '10:00 AM - 12:00 PM',
      isEmergency: true,
      status: 'WORK_IN_PROGRESS',
      bookingFeeAmount: 30,
      platformFeePortion: 20,
      opsFeePortion: 10,
      agreedLaborAmount: 500,
      additionalWorkAmount: 180,
      additionalWorkDescription: 'Found rotted brass coupling behind tiles. Requires chisel chipping and new brass adapter fitting.',
      additionalWorkApproved: true,
      paymentMode: 'DIRECT_CASH_OR_UPI',
      paymentStatus: 'UNPAID',
      createdAt: '2026-10-24T06:15:00Z',
      updatedAt: '2026-10-24T07:30:00Z',
    },
    {
      id: 'b-102',
      bookingNumber: 'LF-26-8911',
      customerId: 'c-2',
      customerName: 'Rajesh Rao',
      customerPhone: '9845023456',
      workerId: 'w-2',
      workerName: 'Manjunath Swamy',
      trade: 'Electrical Services',
      serviceCategory: 'Electrical Services',
      description: 'Main tripping issue when geyser is switched on. Smelled slight burning near distribution board.',
      address: 'Flat 203, Nilaya Heights, Vijayanagar 1st Stage',
      locality: 'Vijayanagar',
      customerLat: MYSURU_LOCALITIES['Vijayanagar'].lat,
      customerLng: MYSURU_LOCALITIES['Vijayanagar'].lng,
      distanceKm: 1.2,
      requestedDate: '2026-10-24',
      requestedTimeSlot: '02:00 PM - 04:00 PM',
      isEmergency: false,
      status: 'NEGOTIATION',
      bookingFeeAmount: 30,
      platformFeePortion: 20,
      opsFeePortion: 10,
      paymentMode: 'DIRECT_CASH_OR_UPI',
      paymentStatus: 'UNPAID',
      createdAt: '2026-10-24T07:00:00Z',
      updatedAt: '2026-10-24T07:45:00Z',
    },
    {
      id: 'b-103',
      bookingNumber: 'LF-26-8912',
      customerId: 'c-3',
      customerName: 'Ananya Gowda',
      customerPhone: '9845034567',
      workerId: 'w-3',
      workerName: 'Suresh Kumar',
      trade: 'Painting',
      serviceCategory: 'Painting & Waterproofing',
      description: 'Living room dampness treatment and two coat touch-up paint before Diwali.',
      address: '15th Cross, Kuvempunagar M-Block',
      locality: 'Kuvempunagar',
      customerLat: MYSURU_LOCALITIES['Kuvempunagar'].lat,
      customerLng: MYSURU_LOCALITIES['Kuvempunagar'].lng,
      distanceKm: 0.5,
      requestedDate: '2026-10-23',
      requestedTimeSlot: '09:00 AM - 01:00 PM',
      isEmergency: false,
      status: 'COMPLETED',
      bookingFeeAmount: 30,
      platformFeePortion: 20,
      opsFeePortion: 10,
      agreedLaborAmount: 850,
      paymentMode: 'DIRECT_CASH_OR_UPI',
      paymentStatus: 'PAID_TO_WORKER',
      createdAt: '2026-10-23T08:00:00Z',
      updatedAt: '2026-10-23T14:30:00Z',
    },
    {
      id: 'b-104',
      bookingNumber: 'LF-26-8913',
      customerId: 'c-4',
      customerName: 'Vikram Patel',
      customerPhone: '9845045678',
      workerId: 'w-4',
      workerName: 'Anand Prasad',
      trade: 'Carpentry',
      serviceCategory: 'Carpentry & Woodwork',
      description: 'Teak main door lock replacement and hinge alignment.',
      address: '8th Main, Saraswathipuram',
      locality: 'Saraswathipuram',
      customerLat: MYSURU_LOCALITIES['Saraswathipuram'].lat,
      customerLng: MYSURU_LOCALITIES['Saraswathipuram'].lng,
      distanceKm: 0.7,
      requestedDate: '2026-10-22',
      requestedTimeSlot: '11:00 AM - 01:00 PM',
      isEmergency: false,
      status: 'DISPUTED',
      bookingFeeAmount: 30,
      platformFeePortion: 20,
      opsFeePortion: 10,
      agreedLaborAmount: 600,
      disputeId: 'disp-1',
      paymentMode: 'DIRECT_CASH_OR_UPI',
      paymentStatus: 'UNPAID',
      createdAt: '2026-10-22T09:00:00Z',
      updatedAt: '2026-10-22T16:00:00Z',
    },
  ];

  const quotations: Quotation[] = [
    {
      id: 'q-101',
      bookingId: 'b-101',
      workerId: 'w-1',
      proposedAmount: 500,
      inspectionFindings: 'Inspected with pressure gauge. Found ruptured elbow joint inside sink wall. Labor includes wall opening, joint swap, and plaster sealing.',
      status: 'ACCEPTED',
      history: [
        { amount: 500, sender: 'WORKER', note: 'Initial formal quotation after physical inspection', timestamp: '2026-10-24T06:30:00Z' },
        { amount: 500, sender: 'CUSTOMER', note: 'Accepted quote. Proceed with work immediately.', timestamp: '2026-10-24T06:35:00Z' },
      ],
      createdAt: '2026-10-24T06:30:00Z',
      updatedAt: '2026-10-24T06:35:00Z',
    },
    {
      id: 'q-102',
      bookingId: 'b-102',
      workerId: 'w-2',
      proposedAmount: 550,
      inspectionFindings: 'Inspection revealed charred 16A MCB terminal and degraded 2.5mm copper cable insulation leading to geyser circuit.',
      status: 'COUNTER_OFFERED',
      customerCounterAmount: 450,
      counterNotes: 'Can we agree on ₹450 if I provide the spare MCB myself?',
      history: [
        { amount: 550, sender: 'WORKER', note: 'Rewire geyser line + replace charred terminal block', timestamp: '2026-10-24T07:15:00Z' },
        { amount: 450, sender: 'CUSTOMER', note: 'Counter offer: Customer will supply spare MCB', timestamp: '2026-10-24T07:40:00Z' },
      ],
      createdAt: '2026-10-24T07:15:00Z',
      updatedAt: '2026-10-24T07:40:00Z',
    },
  ];

  const additionalWorkRequests: AdditionalWorkRequest[] = [
    {
      id: 'add-1',
      bookingId: 'b-101',
      workerId: 'w-1',
      description: 'Found rotted brass coupling behind tiles. Requires chisel chipping and new brass adapter fitting.',
      estimatedCost: 180,
      status: 'APPROVED',
      requestedAt: '2026-10-24T07:10:00Z',
      respondedAt: '2026-10-24T07:15:00Z',
    },
  ];

  const materialOrders: MaterialOrder[] = [
    {
      id: 'mo-1',
      orderNumber: 'MAT-26-4412',
      bookingId: 'b-101',
      workerId: 'w-1',
      customerId: 'c-1',
      customerName: 'Kavitha S.',
      shopId: 'shop-2',
      shopName: 'Gokulam Electricals & Sanitary Supplies',
      items: [
        { productId: 'p-2', productName: 'Brass Angle Valve 1/2 inch', quantity: 1, unitPrice: 195, subtotal: 195 },
        { productId: 'p-3', productName: 'Teflon Sealing Tape (Pack of 3)', quantity: 1, unitPrice: 60, subtotal: 60 },
        { productId: 'p-5', productName: 'PVC Solvent Cement (100ml Tin)', quantity: 1, unitPrice: 85, subtotal: 85 },
      ],
      status: 'OUT_FOR_DELIVERY',
      subtotalAmount: 340,
      deliveryFeeAmount: 30,
      totalAmount: 370,
      platformCommissionAmount: 17, // 5% of 340
      shopPayableAmount: 323, // 340 - 17
      deliveryPartnerPayableAmount: 30,
      paidByRole: 'CUSTOMER',
      customerApproved: true,
      deliveryPartnerId: 'del-1',
      deliveryPartnerName: 'Sunil D. (Mysuru Express Delivery)',
      dropAddress: 'House #42, 6th Main, Gokulam 3rd Stage, Mysuru',
      dropLocality: 'Gokulam',
      createdAt: '2026-10-24T07:20:00Z',
      updatedAt: '2026-10-24T07:35:00Z',
    },
  ];

  const disputes: Dispute[] = [
    {
      id: 'disp-1',
      bookingId: 'b-104',
      raisedByUserId: 'c-4',
      raisedByRole: 'CUSTOMER',
      reason: 'Work Incomplete / Latch Scratch',
      description: 'The worker installed the lock cylinder but left before adjusting the strike plate. The door now sticks and does not latch smoothly.',
      status: 'UNDER_REVIEW',
      resolutionNote: 'Admin has requested worker to return for free adjustment or issue a partial labor fee adjustment.',
      createdAt: '2026-10-22T16:00:00Z',
    },
  ];

  const reviews: Review[] = [
    {
      id: 'rev-1',
      bookingId: 'b-103',
      customerId: 'c-3',
      customerName: 'Ananya Gowda',
      workerId: 'w-3',
      rating: 5,
      comment: 'Suresh was extremely punctual and neat. No paint splatters on my wooden furniture. Very honest pricing.',
      createdAt: '2026-10-23T15:00:00Z',
    },
  ];

  const notifications: Notification[] = [
    {
      id: 'notif-1',
      userId: 'c-1',
      title: 'Material Order Out for Delivery',
      message: 'Delivery partner Sunil D. is on the way with your plumbing materials (Order MAT-26-4412). ETA 12 mins.',
      type: 'MATERIAL',
      linkId: 'mo-1',
      read: false,
      createdAt: '2026-10-24T07:35:00Z',
    },
    {
      id: 'notif-2',
      userId: 'w-2',
      title: 'Quotation Counter-Offer Received',
      message: 'Customer Rajesh Rao proposed ₹450 for booking LF-26-8911. Please review in your Active Jobs.',
      type: 'QUOTE',
      linkId: 'b-102',
      read: false,
      createdAt: '2026-10-24T07:40:00Z',
    },
    {
      id: 'notif-3',
      userId: 'admin-1',
      title: 'New Worker Verification Request',
      message: 'Carpenter Anand Prasad has uploaded trade credentials for verification.',
      type: 'SYSTEM',
      linkId: 'w-4',
      read: false,
      createdAt: '2026-10-23T10:00:00Z',
    },
  ];

  const platformSettings: PlatformSettings = {
    bookingAdvanceAmount: 300, // ₹300 advance payable after accepting worker
    bookingFeeAmount: 30, // ₹30
    platformFeePortion: 20, // ₹20
    opsFeePortion: 10, // ₹10
    shopCommissionPercent: 5, // 5%
    deliveryFeeBase: 30, // ₹30
  };

  const auditLogs: AdminAuditLog[] = [
    {
      id: 'log-1',
      adminId: 'admin-1',
      action: 'APPROVE_WORKER',
      targetType: 'WORKER',
      targetId: 'w-1',
      details: 'Approved Basavaraju M. after Aadhaar and reference verification.',
      timestamp: '2026-09-11T11:00:00Z',
    },
    {
      id: 'log-2',
      adminId: 'admin-1',
      action: 'UPDATE_SETTINGS',
      targetType: 'PLATFORM_SETTINGS',
      targetId: 'settings-core',
      details: 'Configured standard booking fee to ₹30 with ₹20 platform revenue allocation.',
      timestamp: '2026-09-01T09:00:00Z',
    },
  ];

  return {
    users,
    workerProfiles,
    categories,
    bookings,
    quotations,
    additionalWorkRequests,
    materialShops,
    products,
    materialOrders,
    disputes,
    reviews,
    notifications,
    platformSettings,
    auditLogs,
  };
}

class LocalFixDatabase {
  private state: DatabaseState;

  constructor() {
    this.state = this.load();
  }

  private load(): DatabaseState {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Failed to read db file, initializing with seed:', err);
    }
    const seed = getInitialSeed();
    this.save(seed);
    return seed;
  }

  public save(data?: DatabaseState) {
    if (data) this.state = data;
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving LocalFix database:', err);
    }
  }

  // Getters
  public getUsers() { return this.state.users; }
  public getWorkerProfiles() { return this.state.workerProfiles; }
  public getCategories() { return this.state.categories; }
  public getBookings() { return this.state.bookings; }
  public getQuotations() { return this.state.quotations; }
  public getAdditionalWorkRequests() { return this.state.additionalWorkRequests; }
  public getMaterialShops() { return this.state.materialShops; }
  public getProducts() { return this.state.products; }
  public getMaterialOrders() { return this.state.materialOrders; }
  public getDisputes() { return this.state.disputes; }
  public getReviews() { return this.state.reviews; }
  public getNotifications() { return this.state.notifications; }
  public getPlatformSettings() { return this.state.platformSettings; }
  public getAuditLogs() { return this.state.auditLogs; }

  // User & Auth
  public findUserById(id: string) {
    return this.state.users.find(u => u.id === id);
  }

  public findWorkerByUserId(userId: string) {
    const profile = this.state.workerProfiles.find(w => w.workerId === userId);
    const user = this.state.users.find(u => u.id === userId);
    return { profile, user };
  }

  public findUserByPhoneOrEmail(phone?: string, email?: string) {
    return this.state.users.find(u => (phone && u.phone === phone) || (email && u.email.toLowerCase() === email.toLowerCase()));
  }

  public registerUser(user: User, workerProfile?: Partial<WorkerProfile>) {
    // Prevent duplicate accounts
    const existing = this.findUserByPhoneOrEmail(user.phone, user.email);
    if (existing) {
      throw new Error(`An account with this phone number or email already exists (${existing.phone}).`);
    }

    this.state.users.push(user);
    if (user.role === 'worker' && workerProfile) {
      const fullProfile: WorkerProfile = {
        workerId: user.id,
        primaryTrade: workerProfile.primaryTrade || 'Plumbing',
        secondaryTrades: workerProfile.secondaryTrades || [],
        experienceYears: Number(workerProfile.experienceYears) || 3,
        hourlyBaseRate: Number(workerProfile.hourlyBaseRate) || 350,
        minInspectionFee: Number(workerProfile.minInspectionFee) || 150,
        serviceAreas: (workerProfile.serviceAreas && workerProfile.serviceAreas.length > 0) ? workerProfile.serviceAreas : [user.addressLocality || 'Gokulam'],
        currentLocality: user.addressLocality || 'Gokulam',
        lat: MYSURU_LOCALITIES[user.addressLocality]?.lat || 12.3300,
        lng: MYSURU_LOCALITIES[user.addressLocality]?.lng || 76.6200,
        isAvailable: workerProfile.isAvailable !== false,
        isVerified: false,
        verificationStatus: 'PENDING',
        idType: 'Aadhaar (Sample)',
        sampleDocumentRef: `DOC-NEW-${Date.now()}`,
        rating: 5.0,
        totalReviews: 0,
        completedJobs: 0,
        languagesSpoken: (workerProfile.languagesSpoken && workerProfile.languagesSpoken.length > 0) ? workerProfile.languagesSpoken : ['Kannada', 'English'],
        bio: workerProfile.bio || 'Independent skilled technician in Mysuru.',
      };
      this.state.workerProfiles.push(fullProfile);
    }
    this.save();
    return user;
  }

  // Bookings & State Machine
  public createBooking(booking: Booking) {
    this.state.bookings.push(booking);
    // Create notification for worker
    this.addNotification({
      id: `notif-${Date.now()}`,
      userId: booking.workerId,
      title: 'New Service Request in Mysuru',
      message: `${booking.customerName} has requested ${booking.serviceCategory} at ${booking.locality}.`,
      type: 'BOOKING',
      linkId: booking.id,
      read: false,
      createdAt: new Date().toISOString(),
    });
    this.save();
    return booking;
  }

  public updateBookingStatus(bookingId: string, status: BookingStatus, updates: Partial<Booking> = {}) {
    const booking = this.state.bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');
    
    // Validate transitions
    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      'REQUEST_SUBMITTED': ['WORKER_ACCEPTED', 'AWAITING_CUSTOMER_DECISION', 'ACCEPTED', 'CANCELLED'],
      'REQUESTED': ['WORKER_ACCEPTED', 'AWAITING_CUSTOMER_DECISION', 'ACCEPTED', 'CANCELLED'],
      'WORKER_ACCEPTED': ['AWAITING_CUSTOMER_DECISION', 'PAYMENT_PENDING', 'BOOKING_CONFIRMED', 'ACCEPTED', 'CANCELLED'],
      'AWAITING_CUSTOMER_DECISION': ['PAYMENT_PENDING', 'BOOKING_CONFIRMED', 'ACCEPTED', 'CANCELLED'],
      'PAYMENT_PENDING': ['BOOKING_CONFIRMED', 'ACCEPTED', 'CANCELLED'],
      'BOOKING_CONFIRMED': ['QUOTATION_PENDING', 'WORK_IN_PROGRESS', 'SCHEDULED', 'CANCELLED'],
      'ACCEPTED': ['BOOKING_CONFIRMED', 'QUOTATION_PENDING', 'CANCELLED', 'WORK_IN_PROGRESS', 'SCHEDULED'],
      'QUOTATION_PENDING': ['NEGOTIATION', 'QUOTATION_ACCEPTED', 'WORK_IN_PROGRESS', 'CANCELLED'],
      'NEGOTIATION': ['QUOTATION_ACCEPTED', 'WORK_IN_PROGRESS', 'CANCELLED', 'QUOTATION_PENDING'],
      'QUOTATION_ACCEPTED': ['SCHEDULED', 'WORK_IN_PROGRESS', 'CANCELLED'],
      'SCHEDULED': ['WORK_IN_PROGRESS', 'CANCELLED'],
      'WORK_IN_PROGRESS': ['ADDITIONAL_WORK_PENDING', 'COMPLETION_PENDING', 'COMPLETED', 'CANCELLED', 'DISPUTED'],
      'ADDITIONAL_WORK_PENDING': ['WORK_IN_PROGRESS', 'DISPUTED', 'CANCELLED'],
      'COMPLETION_PENDING': ['COMPLETED', 'DISPUTED'],
      'COMPLETED': ['DISPUTED'],
      'CANCELLED': [],
      'DISPUTED': ['COMPLETED', 'CANCELLED'],
    };

    const allowed = validTransitions[booking.status] || [];
    if (!allowed.includes(status)) {
      throw new Error(`Invalid state transition from ${booking.status} to ${status}`);
    }

    booking.status = status;
    booking.updatedAt = new Date().toISOString();
    Object.assign(booking, updates);
    this.save();
    return booking;
  }

  // Quotation Management
  public submitQuotation(quotation: Quotation) {
    const existingIdx = this.state.quotations.findIndex(q => q.bookingId === quotation.bookingId);
    if (existingIdx >= 0) {
      this.state.quotations[existingIdx] = quotation;
    } else {
      this.state.quotations.push(quotation);
    }

    const booking = this.state.bookings.find(b => b.id === quotation.bookingId);
    if (booking) {
      booking.status = quotation.status === 'COUNTER_OFFERED' ? 'NEGOTIATION' : 'QUOTATION_PENDING';
      booking.agreedLaborAmount = quotation.proposedAmount;
      booking.updatedAt = new Date().toISOString();

      // notify customer
      this.addNotification({
        id: `notif-${Date.now()}`,
        userId: booking.customerId,
        title: 'Technician Inspection Quotation Ready',
        message: `${booking.workerName} has submitted a quote of ₹${quotation.proposedAmount} for booking ${booking.bookingNumber}.`,
        type: 'QUOTE',
        linkId: booking.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    this.save();
    return quotation;
  }

  // Additional Work
  public createAdditionalWork(req: AdditionalWorkRequest) {
    this.state.additionalWorkRequests.push(req);
    const booking = this.state.bookings.find(b => b.id === req.bookingId);
    if (booking) {
      booking.status = 'ADDITIONAL_WORK_PENDING';
      booking.additionalWorkDescription = req.description;
      booking.additionalWorkAmount = req.estimatedCost;
      booking.additionalWorkApproved = false;
      booking.updatedAt = new Date().toISOString();

      // Notify customer
      this.addNotification({
        id: `notif-${Date.now()}`,
        userId: booking.customerId,
        title: 'Additional Work Approval Required',
        message: `${booking.workerName} encountered unexpected issue: "${req.description}" (+₹${req.estimatedCost}). Please approve to proceed.`,
        type: 'BOOKING',
        linkId: booking.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
    this.save();
    return req;
  }

  public respondAdditionalWork(requestId: string, approve: boolean) {
    const req = this.state.additionalWorkRequests.find(r => r.id === requestId);
    if (!req) throw new Error('Additional work request not found');
    req.status = approve ? 'APPROVED' : 'REJECTED';
    req.respondedAt = new Date().toISOString();

    const booking = this.state.bookings.find(b => b.id === req.bookingId);
    if (booking) {
      booking.additionalWorkApproved = approve;
      booking.status = 'WORK_IN_PROGRESS';
      if (!approve) {
        booking.additionalWorkAmount = 0;
      }
      booking.updatedAt = new Date().toISOString();

      this.addNotification({
        id: `notif-${Date.now()}`,
        userId: booking.workerId,
        title: approve ? 'Additional Work Approved' : 'Additional Work Declined',
        message: `Customer ${approve ? 'approved' : 'declined'} additional work for ${booking.bookingNumber}.`,
        type: 'BOOKING',
        linkId: booking.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
    this.save();
    return req;
  }

  // Material Orders & Rapid Delivery Simulation
  public createMaterialOrder(order: MaterialOrder) {
    this.state.materialOrders.push(order);
    // Notify shop
    const shop = this.state.materialShops.find(s => s.id === order.shopId);
    if (shop) {
      this.addNotification({
        id: `notif-${Date.now()}`,
        userId: shop.ownerId,
        title: 'New Material Dispatch Order',
        message: `Order ${order.orderNumber} placed for ${order.dropLocality}. Total: ₹${order.totalAmount}.`,
        type: 'MATERIAL',
        linkId: order.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
    this.save();
    return order;
  }

  public updateMaterialOrderStatus(orderId: string, status: DeliveryStatus, updates: Partial<MaterialOrder> = {}) {
    const order = this.state.materialOrders.find(o => o.id === orderId);
    if (!order) throw new Error('Material order not found');
    order.status = status;
    order.updatedAt = new Date().toISOString();
    Object.assign(order, updates);
    this.save();
    return order;
  }

  // Reviews & Disputes
  public addReview(review: Review) {
    const booking = this.state.bookings.find(b => b.id === review.bookingId);
    if (!booking) throw new Error('Booking not found');
    if (booking.status !== 'COMPLETED') {
      throw new Error('Only completed bookings can be reviewed');
    }
    // Prevent duplicate reviews
    const exists = this.state.reviews.some(r => r.bookingId === review.bookingId);
    if (exists) throw new Error('Duplicate review for booking not allowed');

    this.state.reviews.push(review);

    // Update worker average rating and reviews count
    const worker = this.state.workerProfiles.find(w => w.workerId === review.workerId);
    if (worker) {
      const allWorkerReviews = this.state.reviews.filter(r => r.workerId === review.workerId);
      const totalScore = allWorkerReviews.reduce((sum, r) => sum + r.rating, 0);
      worker.rating = Math.round((totalScore / allWorkerReviews.length) * 10) / 10;
      worker.totalReviews = allWorkerReviews.length;
    }

    this.save();
    return review;
  }

  public createDispute(dispute: Dispute) {
    this.state.disputes.push(dispute);
    const booking = this.state.bookings.find(b => b.id === dispute.bookingId);
    if (booking) {
      booking.status = 'DISPUTED';
      booking.disputeId = dispute.id;
      booking.updatedAt = new Date().toISOString();
    }
    this.addAuditLog({
      id: `log-${Date.now()}`,
      adminId: 'SYSTEM',
      action: 'DISPUTE_FILED',
      targetType: 'BOOKING',
      targetId: dispute.bookingId,
      details: `Dispute filed by ${dispute.raisedByRole}: ${dispute.reason}`,
      timestamp: new Date().toISOString(),
    });
    this.save();
    return dispute;
  }

  public resolveDispute(disputeId: string, resolutionNote: string, refundAmount: number) {
    const dispute = this.state.disputes.find(d => d.id === disputeId);
    if (!dispute) throw new Error('Dispute not found');
    dispute.status = 'RESOLVED';
    dispute.resolutionNote = resolutionNote;
    dispute.refundAmount = refundAmount;
    dispute.resolvedAt = new Date().toISOString();

    const booking = this.state.bookings.find(b => b.id === dispute.bookingId);
    if (booking) {
      booking.status = 'COMPLETED';
      booking.paymentStatus = refundAmount > 0 ? 'REFUNDED' : 'PAID_TO_WORKER';
      booking.updatedAt = new Date().toISOString();
    }

    this.addAuditLog({
      id: `log-${Date.now()}`,
      adminId: 'admin-1',
      action: 'DISPUTE_RESOLVED',
      targetType: 'DISPUTE',
      targetId: disputeId,
      details: `Resolved with note: "${resolutionNote}". Refund: ₹${refundAmount}.`,
      timestamp: new Date().toISOString(),
    });

    this.save();
    return dispute;
  }

  // Admin Controls
  public updateWorkerVerification(workerId: string, status: 'VERIFIED' | 'REJECTED', adminId: string) {
    const worker = this.state.workerProfiles.find(w => w.workerId === workerId);
    if (!worker) throw new Error('Worker profile not found');
    worker.verificationStatus = status;
    worker.isVerified = status === 'VERIFIED';
    this.addAuditLog({
      id: `log-${Date.now()}`,
      adminId,
      action: status === 'VERIFIED' ? 'VERIFY_WORKER' : 'REJECT_WORKER',
      targetType: 'WORKER',
      targetId: workerId,
      details: `Worker verification status updated to ${status}`,
      timestamp: new Date().toISOString(),
    });
    this.save();
    return worker;
  }

  public updatePlatformSettings(settings: Partial<PlatformSettings>, adminId: string) {
    Object.assign(this.state.platformSettings, settings);
    this.addAuditLog({
      id: `log-${Date.now()}`,
      adminId,
      action: 'UPDATE_SETTINGS',
      targetType: 'PLATFORM_SETTINGS',
      targetId: 'settings',
      details: `Updated platform settings: ${JSON.stringify(settings)}`,
      timestamp: new Date().toISOString(),
    });
    this.save();
    return this.state.platformSettings;
  }

  public addAuditLog(log: AdminAuditLog) {
    this.state.auditLogs.unshift(log);
  }

  public addNotification(notif: Notification) {
    this.state.notifications.unshift(notif);
  }

  public markNotificationRead(notifId: string) {
    const n = this.state.notifications.find(item => item.id === notifId);
    if (n) {
      n.read = true;
      this.save();
    }
  }

  // Reset database to initial seed (useful for tests)
  public resetSeed() {
    this.state = getInitialSeed();
    this.save(this.state);
    return this.state;
  }
}

export const db = new LocalFixDatabase();
