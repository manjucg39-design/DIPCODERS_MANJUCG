import { Router, Request, Response } from 'express';
import { db, MYSURU_LOCALITIES, calculateHaversineDistance } from './db';
import { BookingStatus, DeliveryStatus } from './schema';

export const apiRouter = Router();

// Middleware to mock/simulate current authenticated user from headers or fallback
function getCurrentUser(req: Request) {
  const userId = req.headers['x-user-id'] as string;
  if (userId) {
    const user = db.findUserById(userId);
    if (user) return user;
  }
  // Default demo user: Customer Kavitha S.
  return db.getUsers().find(u => u.role === 'customer') || db.getUsers()[0];
}

// 1. Auth & Profiles
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  let workerProfile = null;
  if (user.role === 'worker') {
    workerProfile = db.findWorkerByUserId(user.id).profile;
  }
  res.json({ user, workerProfile });
});

apiRouter.get('/auth/users', (req: Request, res: Response) => {
  res.json(db.getUsers());
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const {
    name,
    email,
    phone,
    password,
    confirmPassword,
    role,
    language,
    locality,
    avatar,
    // Worker specific fields
    trade,
    secondaryTrades,
    experienceYears,
    serviceAreas,
    languagesSpoken,
    availability,
    hourlyBaseRate,
    bio,
  } = req.body;

  if (!name || !phone || !password || !role) {
    return res.status(400).json({ error: 'Full name, mobile number, password, and account type are required.' });
  }

  if (role !== 'customer' && role !== 'worker') {
    return res.status(400).json({ error: 'Account type must be Customer or Worker.' });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    const id = `${role === 'worker' ? 'w' : 'c'}-${Date.now()}`;
    const newUser = db.registerUser(
      {
        id,
        name: name.trim(),
        email: email ? email.trim() : `${name.toLowerCase().replace(/\s+/g, '')}@localfix.user`,
        phone: phone.trim(),
        password,
        role,
        language: language || 'kn',
        addressLocality: locality || 'Gokulam',
        avatar: avatar || undefined,
        createdAt: new Date().toISOString(),
      },
      role === 'worker'
        ? {
            primaryTrade: trade || 'Plumbing',
            secondaryTrades: Array.isArray(secondaryTrades) ? secondaryTrades : (secondaryTrades ? [secondaryTrades] : []),
            experienceYears: Number(experienceYears) || 3,
            hourlyBaseRate: Number(hourlyBaseRate) || 350,
            serviceAreas: Array.isArray(serviceAreas) && serviceAreas.length > 0 ? serviceAreas : [locality || 'Gokulam'],
            languagesSpoken: Array.isArray(languagesSpoken) && languagesSpoken.length > 0 ? languagesSpoken : ['Kannada', 'English'],
            isAvailable: availability !== false,
            bio: bio || 'Independent skilled worker in Mysuru.',
          }
        : undefined
    );

    let workerProfile = null;
    if (newUser.role === 'worker') {
      workerProfile = db.findWorkerByUserId(newUser.id).profile;
    }

    res.status(201).json({ user: newUser, workerProfile });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { loginIdentifier, password } = req.body;
  if (!loginIdentifier || !password) {
    return res.status(400).json({ error: 'Mobile number or email and password are required.' });
  }

  const users = db.getUsers();
  const user = users.find(
    u => (u.phone === loginIdentifier.trim() || (u.email && u.email.toLowerCase() === loginIdentifier.trim().toLowerCase()))
  );

  if (!user) {
    return res.status(401).json({ error: 'No account found with this mobile number or email.' });
  }

  if (user.password && user.password !== password) {
    return res.status(401).json({ error: 'Incorrect password. Please try again.' });
  }

  let workerProfile = null;
  if (user.role === 'worker') {
    workerProfile = db.findWorkerByUserId(user.id).profile;
  }

  res.json({ user, workerProfile });
});

// 2. Categories
apiRouter.get('/categories', (req: Request, res: Response) => {
  res.json(db.getCategories());
});

// 3. Workers & Hyperlocal Discovery
apiRouter.get('/workers', (req: Request, res: Response) => {
  const { trade, locality, minRating, maxPrice, search } = req.query;
  const userLocality = (locality as string) || 'Gokulam';
  const customerCoord = MYSURU_LOCALITIES[userLocality] || MYSURU_LOCALITIES['Gokulam'];

  const results = db.getWorkerProfiles().map(profile => {
    const user = db.findUserById(profile.workerId);
    // Real Haversine spherical calculation using Mysuru localities
    const distanceKm = calculateHaversineDistance(
      customerCoord.lat,
      customerCoord.lng,
      profile.lat,
      profile.lng
    );

    return {
      ...profile,
      user,
      distanceKm,
    };
  }).filter(worker => {
    if (trade && trade !== 'all' && worker.primaryTrade.toLowerCase() !== (trade as string).toLowerCase()) {
      return false;
    }
    if (minRating && worker.rating < Number(minRating)) {
      return false;
    }
    if (maxPrice && worker.hourlyBaseRate > Number(maxPrice)) {
      return false;
    }
    if (search) {
      const q = (search as string).toLowerCase();
      const matchesName = worker.user?.name.toLowerCase().includes(q);
      const matchesTrade = worker.primaryTrade.toLowerCase().includes(q);
      const matchesBio = worker.bio.toLowerCase().includes(q);
      const matchesArea = worker.serviceAreas.some(a => a.toLowerCase().includes(q));
      if (!matchesName && !matchesTrade && !matchesBio && !matchesArea) return false;
    }
    return true;
  });

  // Sort by nearest distance first
  results.sort((a, b) => a.distanceKm - b.distanceKm);
  res.json(results);
});

apiRouter.get('/workers/:id', (req: Request, res: Response) => {
  const { profile, user } = db.findWorkerByUserId(req.params.id);
  if (!profile || !user) {
    return res.status(404).json({ error: 'Worker not found' });
  }
  const reviews = db.getReviews().filter(r => r.workerId === profile.workerId);
  res.json({ ...profile, user, reviews });
});

apiRouter.post('/workers/:id/availability', (req: Request, res: Response) => {
  const profile = db.getWorkerProfiles().find(w => w.workerId === req.params.id);
  if (!profile) return res.status(404).json({ error: 'Worker not found' });
  profile.isAvailable = req.body.isAvailable !== false;
  db.save();
  res.json(profile);
});

apiRouter.post('/workers/:id/rate', (req: Request, res: Response) => {
  const profile = db.getWorkerProfiles().find(w => w.workerId === req.params.id);
  if (!profile) return res.status(404).json({ error: 'Worker not found' });
  if (req.body.hourlyBaseRate) {
    profile.hourlyBaseRate = Number(req.body.hourlyBaseRate);
    db.save();
  }
  res.json(profile);
});

// 4. Bookings & Lifecycle
apiRouter.get('/bookings', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  let list = db.getBookings();
  if (user.role === 'customer') {
    list = list.filter(b => b.customerId === user.id);
  } else if (user.role === 'worker') {
    list = list.filter(b => b.workerId === user.id);
  }
  // Admin sees all
  res.json(list);
});

apiRouter.get('/bookings/:id', (req: Request, res: Response) => {
  const booking = db.getBookings().find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  const quotation = db.getQuotations().find(q => q.bookingId === booking.id);
  const additionalWork = db.getAdditionalWorkRequests().filter(a => a.bookingId === booking.id);
  const materialOrders = db.getMaterialOrders().filter(m => m.bookingId === booking.id);
  const dispute = db.getDisputes().find(d => d.bookingId === booking.id);
  const review = db.getReviews().find(r => r.bookingId === booking.id);
  res.json({ booking, quotation, additionalWork, materialOrders, dispute, review });
});

apiRouter.post('/bookings', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { workerId, trade, serviceCategory, description, address, locality, requestedDate, requestedTimeSlot, isEmergency, imageUrl } = req.body;
  
  if (!trade || !address) {
    return res.status(400).json({ error: 'Trade and service address are required.' });
  }

  // If workerId is provided, find that specific worker. Otherwise match nearest or default worker in that trade.
  let targetWorker = workerId ? db.findUserById(workerId) : null;
  let targetProfile = workerId ? db.getWorkerProfiles().find(w => w.workerId === workerId) : null;

  if (!targetWorker || !targetProfile) {
    const candidateProfile = db.getWorkerProfiles().find(w => w.primaryTrade.toLowerCase().includes(trade.toLowerCase()) && w.isAvailable) || db.getWorkerProfiles()[0];
    targetProfile = candidateProfile;
    targetWorker = db.findUserById(candidateProfile.workerId);
  }

  if (!targetWorker || !targetProfile) {
    return res.status(404).json({ error: 'No available worker found for this trade.' });
  }

  const custLoc = locality || user.addressLocality || 'Gokulam';
  const custCoord = MYSURU_LOCALITIES[custLoc] || MYSURU_LOCALITIES['Gokulam'];
  const dist = calculateHaversineDistance(custCoord.lat, custCoord.lng, targetProfile.lat, targetProfile.lng);

  const settings = db.getPlatformSettings();
  const advanceAmount = settings.bookingAdvanceAmount || 300;

  // STEP 1: ZERO UPFRONT FEE. Save request, status = REQUEST_SUBMITTED
  const newBooking = db.createBooking({
    id: `b-${Date.now()}`,
    bookingNumber: `LF-26-${Math.floor(1000 + Math.random() * 9000)}`,
    customerId: user.id,
    customerName: user.name,
    customerPhone: user.phone,
    workerId: targetWorker.id,
    workerName: targetWorker.name,
    trade,
    serviceCategory: serviceCategory || `${trade} Services`,
    description: description || 'General service inspection requested.',
    address,
    locality: custLoc,
    customerLat: custCoord.lat,
    customerLng: custCoord.lng,
    distanceKm: dist,
    requestedDate: requestedDate || new Date().toISOString().split('T')[0],
    requestedTimeSlot: requestedTimeSlot || 'Morning 10:00 AM - 12:00 PM',
    isEmergency: !!isEmergency,
    status: 'REQUEST_SUBMITTED',
    bookingFeeAmount: 0, // NO UPFRONT CHARGE AT SUBMISSION!
    bookingAdvanceAmount: advanceAmount, // ₹300 advance payable only after worker accepts & customer reviews
    advancePaid: false,
    platformFeePortion: settings.platformFeePortion,
    opsFeePortion: settings.opsFeePortion,
    imageUrl: imageUrl || undefined,
    paymentMode: 'DIRECT_CASH_OR_UPI',
    paymentStatus: 'UNPAID',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  res.status(201).json(newBooking);
});

// STEP 2: Worker Accepts Request -> status becomes WORKER_ACCEPTED
apiRouter.post('/bookings/:id/accept', (req: Request, res: Response) => {
  try {
    const booking = db.getBookings().find(b => b.id === req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const updated = db.updateBookingStatus(req.params.id, 'WORKER_ACCEPTED', {
      estimatedArrivalTime: req.body.estimatedArrivalTime || 'Within 30-45 minutes',
    });

    db.addNotification({
      id: `notif-${Date.now()}`,
      userId: booking.customerId,
      title: 'Technician Accepted Your Service Request',
      message: `${booking.workerName} has accepted your ${booking.trade} request. Review profile and confirm booking to proceed.`,
      type: 'BOOKING',
      linkId: booking.id,
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// STEP 4: Customer Reviews Worker & Chooses to Proceed by Paying ₹300 Advance -> status becomes BOOKING_CONFIRMED
apiRouter.post('/bookings/:id/proceed-advance', (req: Request, res: Response) => {
  const { paymentMode } = req.body;
  try {
    const booking = db.getBookings().find(b => b.id === req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const settings = db.getPlatformSettings();
    const advanceAmount = booking.bookingAdvanceAmount || settings.bookingAdvanceAmount || 300;

    const updated = db.updateBookingStatus(req.params.id, 'BOOKING_CONFIRMED', {
      advancePaid: true,
      advancePaymentMode: paymentMode || 'UPI',
      advanceTransactionId: `ADV-MYS-${Date.now()}`,
      bookingFeeAmount: advanceAmount,
      updatedAt: new Date().toISOString(),
    });

    db.addNotification({
      id: `notif-${Date.now()}`,
      userId: booking.workerId,
      title: 'Booking Confirmed with Advance Paid!',
      message: `Customer ${booking.customerName} paid ₹${advanceAmount} advance and confirmed booking ${booking.bookingNumber}. Address: ${booking.address}, ${booking.locality}.`,
      type: 'BOOKING',
      linkId: booking.id,
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// STEP 3: Customer Declines Worker (No penalty)
apiRouter.post('/bookings/:id/customer-decline', (req: Request, res: Response) => {
  try {
    const updated = db.updateBookingStatus(req.params.id, 'CANCELLED', {
      cancellationReason: req.body.reason || 'Customer chose to decline worker (no cancellation penalty)',
      cancelledBy: 'CUSTOMER',
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Worker Declines Request
apiRouter.post('/bookings/:id/decline', (req: Request, res: Response) => {
  try {
    const updated = db.updateBookingStatus(req.params.id, 'CANCELLED', {
      cancellationReason: req.body.reason || 'Worker unavailable at requested time',
      cancelledBy: 'WORKER',
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Quotation & Price Negotiation (Worker-First)
apiRouter.post('/bookings/:id/quotation', (req: Request, res: Response) => {
  const { proposedAmount, inspectionFindings } = req.body;
  if (!proposedAmount || Number(proposedAmount) <= 0) {
    return res.status(400).json({ error: 'Valid proposed quotation amount is required' });
  }
  const booking = db.getBookings().find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const quotation = db.submitQuotation({
    id: `q-${Date.now()}`,
    bookingId: booking.id,
    workerId: booking.workerId,
    proposedAmount: Number(proposedAmount),
    inspectionFindings: inspectionFindings || 'On-site physical inspection complete. Work scope estimated.',
    status: 'PENDING',
    history: [
      {
        amount: Number(proposedAmount),
        sender: 'WORKER',
        note: inspectionFindings || 'Inspection quotation submitted',
        timestamp: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  res.json(quotation);
});

apiRouter.post('/bookings/:id/quotation/counter', (req: Request, res: Response) => {
  const { counterAmount, notes } = req.body;
  if (!counterAmount || Number(counterAmount) <= 0) {
    return res.status(400).json({ error: 'Valid counter offer amount is required' });
  }
  const quotation = db.getQuotations().find(q => q.bookingId === req.params.id);
  if (!quotation) return res.status(404).json({ error: 'Quotation not found' });

  quotation.status = 'COUNTER_OFFERED';
  quotation.customerCounterAmount = Number(counterAmount);
  quotation.counterNotes = notes || 'Customer proposed revised budget';
  quotation.history.push({
    amount: Number(counterAmount),
    sender: 'CUSTOMER',
    note: notes || 'Counter-offer submitted',
    timestamp: new Date().toISOString(),
  });
  quotation.updatedAt = new Date().toISOString();

  const booking = db.getBookings().find(b => b.id === req.params.id);
  if (booking) {
    booking.status = 'NEGOTIATION';
    booking.updatedAt = new Date().toISOString();
  }

  db.save();
  res.json(quotation);
});

apiRouter.post('/bookings/:id/quotation/accept', (req: Request, res: Response) => {
  const quotation = db.getQuotations().find(q => q.bookingId === req.params.id);
  if (!quotation) return res.status(404).json({ error: 'Quotation not found' });

  const finalAmount = quotation.customerCounterAmount && quotation.status === 'COUNTER_OFFERED'
    ? quotation.customerCounterAmount
    : quotation.proposedAmount;

  quotation.status = 'ACCEPTED';
  quotation.proposedAmount = finalAmount;
  quotation.updatedAt = new Date().toISOString();

  const updatedBooking = db.updateBookingStatus(req.params.id, 'WORK_IN_PROGRESS', {
    agreedLaborAmount: finalAmount,
  });

  db.save();
  res.json({ quotation, booking: updatedBooking });
});

apiRouter.post('/bookings/:id/quotation/reject', (req: Request, res: Response) => {
  const quotation = db.getQuotations().find(q => q.bookingId === req.params.id);
  if (!quotation) return res.status(404).json({ error: 'Quotation not found' });

  quotation.status = 'REJECTED';
  quotation.updatedAt = new Date().toISOString();

  const updatedBooking = db.updateBookingStatus(req.params.id, 'CANCELLED', {
    cancellationReason: 'Quotation rejected during negotiation',
    cancelledBy: 'CUSTOMER',
  });

  db.save();
  res.json({ quotation, booking: updatedBooking });
});

// Additional Work Approval
apiRouter.post('/bookings/:id/additional-work', (req: Request, res: Response) => {
  const { description, estimatedCost } = req.body;
  if (!description || !estimatedCost) {
    return res.status(400).json({ error: 'Description and estimated cost are required' });
  }
  const booking = db.getBookings().find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const extraReq = db.createAdditionalWork({
    id: `add-${Date.now()}`,
    bookingId: booking.id,
    workerId: booking.workerId,
    description,
    estimatedCost: Number(estimatedCost),
    status: 'PENDING',
    requestedAt: new Date().toISOString(),
  });

  res.json(extraReq);
});

apiRouter.post('/bookings/:id/additional-work/respond', (req: Request, res: Response) => {
  const { requestId, approve } = req.body;
  if (!requestId || typeof approve !== 'boolean') {
    return res.status(400).json({ error: 'Request ID and approval boolean are required' });
  }
  try {
    const updated = db.respondAdditionalWork(requestId, approve);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Status & Completion Confirmation
apiRouter.post('/bookings/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  try {
    const updated = db.updateBookingStatus(req.params.id, status as BookingStatus);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/bookings/:id/confirm-completion', (req: Request, res: Response) => {
  try {
    const updated = db.updateBookingStatus(req.params.id, 'COMPLETED', {
      paymentStatus: 'PAID_TO_WORKER',
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/bookings/:id/cancel', (req: Request, res: Response) => {
  const { reason, cancelledBy } = req.body;
  try {
    const updated = db.updateBookingStatus(req.params.id, 'CANCELLED', {
      cancellationReason: reason || 'Cancelled by user',
      cancelledBy: cancelledBy || 'CUSTOMER',
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/bookings/:id/dispute', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { reason, description } = req.body;
  if (!reason || !description) {
    return res.status(400).json({ error: 'Reason and description are required' });
  }
  const dispute = db.createDispute({
    id: `disp-${Date.now()}`,
    bookingId: req.params.id,
    raisedByUserId: user.id,
    raisedByRole: user.role === 'worker' ? 'WORKER' : 'CUSTOMER',
    reason,
    description,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  });
  res.json(dispute);
});

// 5. Material Marketplace ("Buy Materials")
apiRouter.get('/materials/shops', (req: Request, res: Response) => {
  res.json(db.getMaterialShops());
});

apiRouter.get('/materials/products', (req: Request, res: Response) => {
  const { category, search, shopId } = req.query;
  let items = db.getProducts();
  if (category && category !== 'all') {
    items = items.filter(p => p.category.toLowerCase() === (category as string).toLowerCase());
  }
  if (shopId) {
    items = items.filter(p => p.shopId === shopId);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    items = items.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  res.json(items);
});

apiRouter.get('/materials/orders', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  let orders = db.getMaterialOrders();
  if (user.role === 'customer') {
    orders = orders.filter(o => o.customerId === user.id);
  } else if (user.role === 'worker') {
    orders = orders.filter(o => o.workerId === user.id);
  } else if (user.role === 'shop') {
    const shop = db.getMaterialShops().find(s => s.ownerId === user.id);
    if (shop) orders = orders.filter(o => o.shopId === shop.id);
  } else if (user.role === 'delivery') {
    orders = orders.filter(o => !o.deliveryPartnerId || o.deliveryPartnerId === user.id);
  }
  res.json(orders);
});

apiRouter.post('/materials/orders', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { bookingId, shopId, items, paidByRole, dropAddress, dropLocality } = req.body;

  if (!shopId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Shop ID and non-empty items array are required' });
  }

  const shop = db.getMaterialShops().find(s => s.id === shopId);
  if (!shop) return res.status(404).json({ error: 'Shop not found' });

  let subtotal = 0;
  const processedItems = items.map((it: any) => {
    const p = db.getProducts().find(prod => prod.id === it.productId);
    const price = p ? p.unitPrice : it.unitPrice || 100;
    const name = p ? p.name : it.productName || 'Material Component';
    const itemSubtotal = price * (it.quantity || 1);
    subtotal += itemSubtotal;
    return {
      productId: it.productId,
      productName: name,
      quantity: it.quantity || 1,
      unitPrice: price,
      subtotal: itemSubtotal,
    };
  });

  const settings = db.getPlatformSettings();
  const deliveryFee = settings.deliveryFeeBase; // ₹30
  const total = subtotal + deliveryFee;
  const commission = Math.round((subtotal * settings.shopCommissionPercent) / 100); // 5%
  const shopPayable = subtotal - commission;

  let customerId = user.id;
  let customerName = user.name;
  let workerId: string | undefined = undefined;

  if (bookingId) {
    const booking = db.getBookings().find(b => b.id === bookingId);
    if (booking) {
      customerId = booking.customerId;
      customerName = booking.customerName;
      workerId = booking.workerId;
    }
  }

  const newOrder = db.createMaterialOrder({
    id: `mo-${Date.now()}`,
    orderNumber: `MAT-26-${Math.floor(1000 + Math.random() * 9000)}`,
    bookingId,
    workerId,
    customerId,
    customerName,
    shopId,
    shopName: shop.name,
    items: processedItems,
    status: 'PENDING',
    subtotalAmount: subtotal,
    deliveryFeeAmount: deliveryFee,
    totalAmount: total,
    platformCommissionAmount: commission,
    shopPayableAmount: shopPayable,
    deliveryPartnerPayableAmount: deliveryFee,
    paidByRole: paidByRole || (user.role === 'customer' ? 'CUSTOMER' : 'WORKER'),
    customerApproved: user.role === 'customer' || !bookingId, // if customer orders, auto-approved
    dropAddress: dropAddress || 'Site Address, Mysuru',
    dropLocality: dropLocality || 'Gokulam',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  res.status(201).json(newOrder);
});

apiRouter.post('/materials/orders/:id/approve', (req: Request, res: Response) => {
  const order = db.getMaterialOrders().find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.customerApproved = true;
  order.updatedAt = new Date().toISOString();
  db.save();
  res.json(order);
});

apiRouter.post('/materials/orders/:id/status', (req: Request, res: Response) => {
  const { status, deliveryPartnerId, deliveryPartnerName } = req.body;
  try {
    const updates: any = {};
    if (deliveryPartnerId) updates.deliveryPartnerId = deliveryPartnerId;
    if (deliveryPartnerName) updates.deliveryPartnerName = deliveryPartnerName;
    const updated = db.updateMaterialOrderStatus(req.params.id, status as DeliveryStatus, updates);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 6. Disputes & Arbitration
apiRouter.get('/disputes', (req: Request, res: Response) => {
  res.json(db.getDisputes());
});

apiRouter.post('/disputes/:id/resolve', (req: Request, res: Response) => {
  const { resolutionNote, refundAmount } = req.body;
  try {
    const updated = db.resolveDispute(req.params.id, resolutionNote || 'Resolved by administrative review', Number(refundAmount) || 0);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 7. Reviews
apiRouter.get('/reviews', (req: Request, res: Response) => {
  const { workerId } = req.query;
  let list = db.getReviews();
  if (workerId) {
    list = list.filter(r => r.workerId === workerId);
  }
  res.json(list);
});

apiRouter.post('/reviews', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { bookingId, workerId, rating, comment } = req.body;
  if (!bookingId || !workerId || !rating) {
    return res.status(400).json({ error: 'Booking ID, Worker ID, and Rating are required' });
  }
  try {
    const review = db.addReview({
      id: `rev-${Date.now()}`,
      bookingId,
      customerId: user.id,
      customerName: user.name,
      workerId,
      rating: Number(rating),
      comment: comment || 'Verified service completion.',
      createdAt: new Date().toISOString(),
    });
    res.status(201).json(review);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 8. Notifications
apiRouter.get('/notifications', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const userNotifs = db.getNotifications().filter(n => n.userId === user.id || n.userId === 'all');
  res.json(userNotifs);
});

apiRouter.post('/notifications/:id/read', (req: Request, res: Response) => {
  db.markNotificationRead(req.params.id);
  res.json({ success: true });
});

// 9. Admin Console & Reconciled Metrics
apiRouter.get('/admin/metrics', (req: Request, res: Response) => {
  const bookings = db.getBookings();
  const materialOrders = db.getMaterialOrders();
  const settings = db.getPlatformSettings();

  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;
  const disputedBookings = bookings.filter(b => b.status === 'DISPUTED').length;
  const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;

  // Booking fees: ₹30 paid per valid booking
  // Platform keeps ₹20, Ops gets ₹10
  const bookingFeesRecorded = bookings.filter(b => b.status !== 'CANCELLED').length * settings.bookingFeeAmount;
  const platformBookingFeeRevenue = bookings.filter(b => b.status !== 'CANCELLED').length * settings.platformFeePortion;
  const opsAllocation = bookings.filter(b => b.status !== 'CANCELLED').length * settings.opsFeePortion;

  // Material shop commissions: 5% of subtotal on completed material orders
  const completedMaterialOrders = materialOrders.filter(m => m.status === 'DELIVERED');
  const shopCommissionsRecorded = completedMaterialOrders.reduce((sum, m) => sum + m.platformCommissionAmount, 0);
  const shopNetSales = completedMaterialOrders.reduce((sum, m) => sum + m.shopPayableAmount, 0);
  const deliveryFeesCollected = completedMaterialOrders.reduce((sum, m) => sum + m.deliveryFeeAmount, 0);

  // Worker direct labor earnings
  const workerLaborEarned = bookings
    .filter(b => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (b.agreedLaborAmount || 0) + (b.additionalWorkApproved ? (b.additionalWorkAmount || 0) : 0), 0);

  // Reconciled Net Platform Revenue
  const netPlatformRevenue = platformBookingFeeRevenue + shopCommissionsRecorded;

  res.json({
    operational: {
      totalCustomers: db.getUsers().filter(u => u.role === 'customer').length,
      totalWorkers: db.getUsers().filter(u => u.role === 'worker').length,
      verifiedWorkers: db.getWorkerProfiles().filter(w => w.isVerified).length,
      totalShops: db.getMaterialShops().length,
      totalBookings,
      completedBookings,
      cancelledBookings,
      disputedBookings,
      completionRatePercent: completionRate,
      materialOrdersCount: materialOrders.length,
      completedMaterialOrdersCount: completedMaterialOrders.length,
    },
    financialReconciliation: {
      bookingFeesRecorded,
      platformBookingFeeRevenue,
      opsAllocation,
      shopCommissionsRecorded,
      shopNetSales,
      deliveryFeesCollected,
      workerLaborEarned,
      netPlatformRevenue,
      accountingNotes: 'Demonstration metrics derived from seeded Mysuru platform transactions. Zero hidden worker deductions.',
    },
  });
});

apiRouter.post('/admin/workers/:id/verify', (req: Request, res: Response) => {
  const { status } = req.body;
  if (!status || (status !== 'VERIFIED' && status !== 'REJECTED')) {
    return res.status(400).json({ error: 'Status must be VERIFIED or REJECTED' });
  }
  try {
    const updated = db.updateWorkerVerification(req.params.id, status, 'admin-1');
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/admin/settings', (req: Request, res: Response) => {
  res.json(db.getPlatformSettings());
});

apiRouter.post('/admin/settings', (req: Request, res: Response) => {
  const updated = db.updatePlatformSettings(req.body, 'admin-1');
  res.json(updated);
});

apiRouter.get('/admin/audit-logs', (req: Request, res: Response) => {
  res.json(db.getAuditLogs());
});
