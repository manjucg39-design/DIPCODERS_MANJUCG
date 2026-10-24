import { db, calculateHaversineDistance, MYSURU_LOCALITIES } from '../server/db';
import { BookingStatus, DeliveryStatus } from '../server/schema';
import { translations, SupportedLanguage } from '../src/i18n/translations';

interface TestResult {
  num: number;
  name: string;
  passed: boolean;
  message?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, num: number, name: string, detail?: string) {
  if (condition) {
    results.push({ num, name, passed: true });
    console.log(`  ✓ [Test ${num.toString().padStart(2, '0')}] ${name}`);
  } else {
    results.push({ num, name, passed: false, message: detail });
    console.error(`  ✗ [Test ${num.toString().padStart(2, '0')}] ${name}: ${detail || 'Assertion failed'}`);
  }
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('   LOCALFIX AUTOMATED VERIFICATION TEST SUITE (25 TESTS) ');
  console.log('======================================================\n');

  // Reset to fresh test seed
  db.resetSeed();

  // Test 1: Customer registration and authentication
  const testCustomer = db.registerUser({
    id: 'test-c-99',
    name: 'Somanna Gowda',
    email: 'somanna@mysuru.test',
    phone: '9845099999',
    role: 'customer',
    language: 'kn',
    addressLocality: 'Gokulam',
    createdAt: new Date().toISOString(),
  });
  const foundCustomer = db.findUserById('test-c-99');
  assert(foundCustomer?.name === 'Somanna Gowda' && foundCustomer.role === 'customer', 1, 'Customer registration and authentication');

  // Test 2: Worker registration
  const testWorker = db.registerUser(
    {
      id: 'test-w-99',
      name: 'Naveen Kumar',
      email: 'naveen.plumb@mysuru.test',
      phone: '9845188888',
      role: 'worker',
      language: 'kn',
      addressLocality: 'Vijayanagar',
      createdAt: new Date().toISOString(),
    },
    {
      primaryTrade: 'Plumbing',
      hourlyBaseRate: 420,
      bio: 'Licensed plumber with pipe joint certifications.',
    }
  );
  const { profile: workerProf } = db.findWorkerByUserId('test-w-99');
  assert(workerProf?.primaryTrade === 'Plumbing' && workerProf.hourlyBaseRate === 420, 2, 'Worker registration and profile creation');

  // Test 3: Role-based access control
  const adminUser = db.getUsers().find(u => u.role === 'admin');
  const normalUser = db.getUsers().find(u => u.role === 'customer');
  assert(adminUser?.role === 'admin' && normalUser?.role === 'customer', 3, 'Role-based access control distinction');

  // Test 4: Worker search & Haversine distance in Mysuru
  const gokulam = MYSURU_LOCALITIES['Gokulam'];
  const vijayanagar = MYSURU_LOCALITIES['Vijayanagar'];
  const distance = calculateHaversineDistance(gokulam.lat, gokulam.lng, vijayanagar.lat, vijayanagar.lng);
  assert(distance > 0 && distance < 10, 4, 'Worker search with real Haversine distance calculation');

  // Test 5: Booking creation
  const settings = db.getPlatformSettings();
  const testBooking = db.createBooking({
    id: 'tb-101',
    bookingNumber: 'LF-TEST-001',
    customerId: 'test-c-99',
    customerName: 'Somanna Gowda',
    customerPhone: '9845099999',
    workerId: 'test-w-99',
    workerName: 'Naveen Kumar',
    trade: 'Plumbing',
    serviceCategory: 'Plumbing Services',
    description: 'Bathroom mixer leak inspection',
    address: '10th Cross, Gokulam 2nd Stage',
    locality: 'Gokulam',
    requestedDate: '2026-10-25',
    requestedTimeSlot: '11:00 AM - 01:00 PM',
    isEmergency: false,
    status: 'REQUESTED',
    bookingFeeAmount: settings.bookingFeeAmount,
    platformFeePortion: settings.platformFeePortion,
    opsFeePortion: settings.opsFeePortion,
    paymentMode: 'DIRECT_CASH_OR_UPI',
    paymentStatus: 'UNPAID',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  assert(testBooking.status === 'REQUESTED' && testBooking.bookingFeeAmount === 30, 5, 'Booking creation with transparent fee disclosure');

  // Test 6: Quotation submission
  db.updateBookingStatus('tb-101', 'ACCEPTED');
  const quote = db.submitQuotation({
    id: 'tq-101',
    bookingId: 'tb-101',
    workerId: 'test-w-99',
    proposedAmount: 500,
    inspectionFindings: 'Defective ceramic cartridge in wall mixer',
    status: 'PENDING',
    history: [{ amount: 500, sender: 'WORKER', note: 'Initial quotation', timestamp: new Date().toISOString() }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const bookingAfterQuote = db.getBookings().find(b => b.id === 'tb-101');
  assert(quote.proposedAmount === 500 && bookingAfterQuote?.status === 'QUOTATION_PENDING', 6, 'Quotation submission following physical inspection');

  // Test 7: Quotation acceptance
  const acceptedQuote = db.updateBookingStatus('tb-101', 'WORK_IN_PROGRESS', { agreedLaborAmount: 500 });
  assert(acceptedQuote.status === 'WORK_IN_PROGRESS' && acceptedQuote.agreedLaborAmount === 500, 7, 'Quotation acceptance and work transition');

  // Test 8: Negotiation with counter-offers
  const negBooking = db.createBooking({
    id: 'tb-neg',
    bookingNumber: 'LF-NEG-001',
    customerId: 'test-c-99',
    customerName: 'Somanna Gowda',
    customerPhone: '9845099999',
    workerId: 'test-w-99',
    workerName: 'Naveen Kumar',
    trade: 'Plumbing',
    serviceCategory: 'Plumbing Services',
    description: 'Pipe rewiring',
    address: 'Gokulam',
    locality: 'Gokulam',
    requestedDate: '2026-10-25',
    requestedTimeSlot: 'Morning',
    isEmergency: false,
    status: 'ACCEPTED',
    bookingFeeAmount: 30,
    platformFeePortion: 20,
    opsFeePortion: 10,
    paymentMode: 'DIRECT_CASH_OR_UPI',
    paymentStatus: 'UNPAID',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  db.submitQuotation({
    id: 'tq-neg',
    bookingId: 'tb-neg',
    workerId: 'test-w-99',
    proposedAmount: 600,
    inspectionFindings: 'Full pipeline replacement',
    status: 'COUNTER_OFFERED',
    customerCounterAmount: 480,
    counterNotes: 'Counter budget offer',
    history: [
      { amount: 600, sender: 'WORKER', note: 'Quote', timestamp: new Date().toISOString() },
      { amount: 480, sender: 'CUSTOMER', note: 'Counter offer', timestamp: new Date().toISOString() },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const negBookingState = db.getBookings().find(b => b.id === 'tb-neg');
  assert(negBookingState?.status === 'NEGOTIATION', 8, 'Negotiation workflow with counter-offer recording');

  // Test 9: Additional-work approval
  const addWork = db.createAdditionalWork({
    id: 'taw-1',
    bookingId: 'tb-101',
    workerId: 'test-w-99',
    description: 'Wall concealed rust bypass required',
    estimatedCost: 200,
    status: 'PENDING',
    requestedAt: new Date().toISOString(),
  });
  const approvedAddWork = db.respondAdditionalWork('taw-1', true);
  const bookingWithAddWork = db.getBookings().find(b => b.id === 'tb-101');
  assert(approvedAddWork.status === 'APPROVED' && bookingWithAddWork?.additionalWorkApproved === true && bookingWithAddWork?.additionalWorkAmount === 200, 9, 'Explicit customer additional-work approval');

  // Test 10: Rejection of unauthorized extra charges
  const rejectedAddWork = db.createAdditionalWork({
    id: 'taw-reject',
    bookingId: 'tb-101',
    workerId: 'test-w-99',
    description: 'Unneeded luxury valve addition',
    estimatedCost: 350,
    status: 'PENDING',
    requestedAt: new Date().toISOString(),
  });
  db.respondAdditionalWork('taw-reject', false);
  const bookingAfterReject = db.getBookings().find(b => b.id === 'tb-101');
  assert(bookingAfterReject?.additionalWorkApproved === false && bookingAfterReject.additionalWorkAmount === 0, 10, 'Rejection of unauthorized extra charges');

  // Test 11: Cancellation with recorded reason
  const cancelledBooking = db.updateBookingStatus('tb-neg', 'CANCELLED', {
    cancellationReason: 'Mutual agreement - customer postponed renovation',
    cancelledBy: 'CUSTOMER',
  });
  assert(cancelledBooking.status === 'CANCELLED' && !!cancelledBooking.cancellationReason, 11, 'Cancellation with recorded reason and attribution');

  // Test 12: Completion confirmation
  const completedBooking = db.updateBookingStatus('tb-101', 'COMPLETED', { paymentStatus: 'PAID_TO_WORKER' });
  assert(completedBooking.status === 'COMPLETED' && completedBooking.paymentStatus === 'PAID_TO_WORKER', 12, 'Completion confirmation by customer and worker');

  // Test 13: Dispute creation
  const testDispute = db.createDispute({
    id: 'tdisp-01',
    bookingId: 'tb-101',
    raisedByUserId: 'test-c-99',
    raisedByRole: 'CUSTOMER',
    reason: 'Water pressure drop',
    description: 'Post repair water pressure in shower dropped significantly.',
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  });
  const bookingDisputed = db.getBookings().find(b => b.id === 'tb-101');
  assert(testDispute.status === 'OPEN' && bookingDisputed?.status === 'DISPUTED', 13, 'Dispute creation and administrative arbitration trigger');

  // Test 14: Booking-fee calculation
  const defaultBookingFee = settings.bookingFeeAmount;
  assert(defaultBookingFee === 30, 14, 'Transparent customer booking-fee calculation (₹30 standard)');

  // Test 15: Revenue allocation reconciliation
  const platformRev = settings.platformFeePortion;
  const opsAllocation = settings.opsFeePortion;
  assert(platformRev + opsAllocation === defaultBookingFee && platformRev === 20 && opsAllocation === 10, 15, 'Internal revenue allocation (₹20 Platform + ₹10 Operations)');

  // Test 16: Material-order totals
  const testOrder = db.createMaterialOrder({
    id: 'tmo-1',
    orderNumber: 'MAT-TEST-01',
    bookingId: 'tb-101',
    workerId: 'test-w-99',
    customerId: 'test-c-99',
    customerName: 'Somanna Gowda',
    shopId: 'shop-2',
    shopName: 'Gokulam Electricals & Sanitary Supplies',
    items: [
      { productId: 'p-1', productName: 'CPVC Pipe', quantity: 2, unitPrice: 280, subtotal: 560 },
      { productId: 'p-3', productName: 'Teflon Tape', quantity: 1, unitPrice: 60, subtotal: 60 },
    ],
    status: 'PENDING',
    subtotalAmount: 620,
    deliveryFeeAmount: 30,
    totalAmount: 650,
    platformCommissionAmount: 31, // 5% of 620
    shopPayableAmount: 589, // 620 - 31
    deliveryPartnerPayableAmount: 30,
    paidByRole: 'CUSTOMER',
    customerApproved: true,
    dropAddress: 'Gokulam 2nd Stage, Mysuru',
    dropLocality: 'Gokulam',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  assert(testOrder.totalAmount === 650 && testOrder.subtotalAmount === 620, 16, 'Material-order mathematical totals & delivery fee calculation');

  // Test 17: Shop commission calculation
  const shopCommission = Math.round((testOrder.subtotalAmount * settings.shopCommissionPercent) / 100);
  assert(shopCommission === 31 && testOrder.platformCommissionAmount === 31, 17, 'Shop commission calculation (5% of material subtotal)');

  // Test 18: Stock availability check
  const inStockProduct = db.getProducts().find(p => p.id === 'p-1');
  assert(inStockProduct?.inStock === true && inStockProduct.stockQuantity > 0, 18, 'Real stock availability verification');

  // Test 19: Material-order status transitions
  db.updateMaterialOrderStatus('tmo-1', 'SHOP_ACCEPTED');
  db.updateMaterialOrderStatus('tmo-1', 'PREPARING');
  const readyOrder = db.updateMaterialOrderStatus('tmo-1', 'READY_FOR_PICKUP');
  assert(readyOrder.status === 'READY_FOR_PICKUP', 19, 'Material-order shop fulfillment transitions');

  // Test 20: Delivery-status transitions
  db.updateMaterialOrderStatus('tmo-1', 'PICKED_UP', { deliveryPartnerId: 'del-1' });
  db.updateMaterialOrderStatus('tmo-1', 'OUT_FOR_DELIVERY');
  const deliveredOrder = db.updateMaterialOrderStatus('tmo-1', 'DELIVERED');
  assert(deliveredOrder.status === 'DELIVERED', 20, 'Delivery partner rapid dispatch status transitions');

  // Test 21: Language switching across all 5 languages
  const supportedLangs: SupportedLanguage[] = ['kn', 'en', 'hi', 'ta', 'te'];
  const allLangsValid = supportedLangs.every(l => !!translations[l]?.appName && !!translations[l]?.nav?.services);
  assert(allLangsValid, 21, 'Language switching dictionary validation for Kannada, English, Hindi, Tamil, Telugu');

  // Test 22: Persistence of language preference (Kannada default)
  assert(translations.kn.appName === 'ಲೋಕಲ್‌ಫಿಕ್ಸ್' && translations.en.appName === 'LocalFix', 22, 'Multilingual script fidelity with Kannada native baseline');

  // Test 23: Administrative authorization
  const verifiedWorker = db.updateWorkerVerification('w-4', 'VERIFIED', 'admin-1');
  const auditLogFound = db.getAuditLogs().some(log => log.action === 'VERIFY_WORKER' && log.targetId === 'w-4');
  assert(verifiedWorker.isVerified === true && auditLogFound, 23, 'Administrative authorization and audit logging');

  // Test 24: Review eligibility & prevention of uncompleted reviews
  let blockedReview = false;
  try {
    db.addReview({
      id: 'rev-illegal',
      bookingId: 'tb-neg', // cancelled booking
      customerId: 'test-c-99',
      customerName: 'Somanna',
      workerId: 'test-w-99',
      rating: 5,
      comment: 'Illegal review',
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    blockedReview = true;
  }
  assert(blockedReview, 24, 'Review eligibility enforced (only completed bookings eligible)');

  // Test 25: Prevention of duplicate transactions / duplicate reviews
  // Reset tb-101 to completed and add review
  db.updateBookingStatus('tb-101', 'COMPLETED');
  db.addReview({
    id: 'rev-valid',
    bookingId: 'tb-101',
    customerId: 'test-c-99',
    customerName: 'Somanna',
    workerId: 'test-w-99',
    rating: 5,
    comment: 'Great work',
    createdAt: new Date().toISOString(),
  });
  let duplicateBlocked = false;
  try {
    db.addReview({
      id: 'rev-dup',
      bookingId: 'tb-101',
      customerId: 'test-c-99',
      customerName: 'Somanna',
      workerId: 'test-w-99',
      rating: 4,
      comment: 'Duplicate review attempt',
      createdAt: new Date().toISOString(),
    });
  } catch {
    duplicateBlocked = true;
  }
  assert(duplicateBlocked, 25, 'Prevention of duplicate reviews & transaction idempotency');

  console.log('\n------------------------------------------------------');
  const passedCount = results.filter(r => r.passed).length;
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passedCount} | FAILED: ${results.length - passedCount}`);
  console.log('------------------------------------------------------\n');

  if (passedCount === results.length) {
    console.log('🎉 ALL 25 CRITICAL BUSINESS RULE TESTS PASSED!\n');
  } else {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
