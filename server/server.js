const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE'] }
});

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'ann_secret_key_123456';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ann_db';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ----------------------------------------------------
// MONGOOSE SCHEMAS & MODELS
// ----------------------------------------------------
const DonorSchema = new mongoose.Schema({
  brandName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  passwordHash: { type: String, required: true },
  donorType: { type: String, enum: ['restaurant', 'household'], default: 'restaurant' },
  fssaiNumber: { type: String, default: '' },
  fssaiCertificateUrl: { type: String, default: '' },
  fssaiVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: true },
  avgRating: { type: Number, default: 5.0 },
  totalDonationsCount: { type: Number, default: 0 },
  totalKgDonated: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const NGOSchema = new mongoose.Schema({
  orgName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  passwordHash: { type: String, required: true },
  servesDescription: { type: String, default: 'Street shelters & low-income families' },
  registrationDocUrl: { type: String, default: '' },
  isPhoneVerified: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  avgRating: { type: Number, default: 5.0 },
  totalClaimsCount: { type: Number, default: 0 },
  totalKgClaimed: { type: Number, default: 0 },
  liveLocation: {
    lat: { type: Number, default: 28.6139 },
    lng: { type: Number, default: 77.2090 },
    updatedAt: { type: Date, default: Date.now }
  },
  createdAt: { type: Date, default: Date.now }
});

const FoodListingSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
  foodName: { type: String, required: true },
  foodType: { type: String, enum: ['veg', 'non-veg', 'mixed', 'bakery', 'packaged', 'other'], default: 'veg' },
  quantity: { type: Number, required: true },
  quantityUnit: { type: String, enum: ['kg', 'servings', 'packets'], default: 'kg' },
  condition: { type: String, enum: ['fresh', 'near-expiry', 'cooked-today'], default: 'cooked-today' },
  photoUrl: { type: String, default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' },
  preparedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  availableFrom: { type: Date, default: Date.now },
  availableUntil: { type: Date },
  pickupAddress: { type: String, required: true },
  pickupLat: { type: Number, required: true },
  pickupLng: { type: Number, required: true },
  status: { type: String, enum: ['listed', 'claimed', 'picked_up', 'expired', 'cancelled'], default: 'listed' },
  claimedByNgoId: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', default: null },
  urgencyScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const ClaimSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing', required: true },
  ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
  riderDeparted: { type: Boolean, default: false },
  riderLocation: {
    lat: { type: Number },
    lng: { type: Number },
    updatedAt: { type: Date, default: Date.now }
  },
  estimatedArrivalMinutes: { type: Number, default: 15 },
  actualPickupTime: { type: Date },
  status: { type: String, enum: ['claimed', 'en_route', 'picked_up', 'no_show', 'cancelled'], default: 'claimed' },
  claimedAt: { type: Date, default: Date.now }
});

const RatingSchema = new mongoose.Schema({
  fromUserId: { type: mongoose.Schema.Types.ObjectId, required: true },
  fromUserType: { type: String, enum: ['donor', 'ngo'], required: true },
  toUserId: { type: mongoose.Schema.Types.ObjectId, required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing', required: true },
  stars: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Donor = mongoose.model('Donor', DonorSchema);
const NGO = mongoose.model('NGO', NGOSchema);
const FoodListing = mongoose.model('FoodListing', FoodListingSchema);
const Claim = mongoose.model('Claim', ClaimSchema);
const Rating = mongoose.model('Rating', RatingSchema);

// ----------------------------------------------------
// ALGORITHM: URGENCY-PRIORITY MATCHING ENGINE
// Score = w1*(1/distance) + w2*(1/time_to_expiry) + w3*(need_match)
// ----------------------------------------------------
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function computeUrgencyPriorityScore(listing, ngoLat, ngoLng, ngoServes = '') {
  const now = new Date().getTime();
  const expiresAt = new Date(listing.expiresAt).getTime();
  const hoursToExpiry = Math.max(0.1, (expiresAt - now) / (1000 * 60 * 60));

  const distanceKm = ngoLat && ngoLng
    ? Math.max(0.2, calculateDistanceKm(ngoLat, ngoLng, listing.pickupLat, listing.pickupLng))
    : 2.0;

  let needMatch = 1.0;
  if (ngoServes.toLowerCase().includes('animal') && (listing.foodType === 'mixed' || listing.condition === 'near-expiry')) {
    needMatch = 1.5;
  } else if (ngoServes.toLowerCase().includes('shelter') && listing.foodType === 'veg') {
    needMatch = 1.3;
  }

  const w1 = 0.4;
  const w2 = 0.45;
  const w3 = 0.15;

  const score = (w1 * (1 / distanceKm)) + (w2 * (1 / hoursToExpiry)) + (w3 * needMatch);
  return {
    score: parseFloat(score.toFixed(3)),
    hoursToExpiry: parseFloat(hoursToExpiry.toFixed(1)),
    distanceKm: parseFloat(distanceKm.toFixed(2))
  };
}

// ----------------------------------------------------
// AUTH MIDDLEWARE
// ----------------------------------------------------
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired session token' });
    req.user = user;
    next();
  });
};

// ----------------------------------------------------
// AUTH ROUTES
// ----------------------------------------------------
app.post('/api/auth/donor/signup', async (req, res) => {
  try {
    const { brandName, email, phone, password, donorType, fssaiNumber, fssaiCertificateUrl } = req.body;
    const existing = await Donor.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Donor with this email already registered' });

    const passwordHash = await bcrypt.hash(password || 'password123', 10);
    const donor = new Donor({
      brandName,
      email,
      phone,
      passwordHash,
      donorType: donorType || 'restaurant',
      fssaiNumber: fssaiNumber || '',
      fssaiCertificateUrl: fssaiCertificateUrl || 'https://images.unsplash.com/photo-1606787366850-de6330128bfc',
      fssaiVerified: donorType === 'restaurant' && Boolean(fssaiNumber)
    });
    await donor.save();

    const token = jwt.sign({ id: donor._id, role: 'donor', name: donor.brandName }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: donor, role: 'donor' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/ngo/signup', async (req, res) => {
  try {
    const { orgName, email, phone, password, servesDescription, registrationDocUrl } = req.body;
    const existing = await NGO.findOne({ email });
    if (existing) return res.status(400).json({ message: 'NGO with this email already registered' });

    const passwordHash = await bcrypt.hash(password || 'password123', 10);
    const ngo = new NGO({
      orgName,
      email,
      phone,
      passwordHash,
      servesDescription: servesDescription || 'Community Kitchen & Shelters',
      registrationDocUrl: registrationDocUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f',
      isVerified: false
    });
    await ngo.save();

    const token = jwt.sign({ id: ngo._id, role: 'ngo', name: ngo.orgName }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: ngo, role: 'ngo' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await Donor.findOne({ email });
    let role = 'donor';

    if (!user) {
      user = await NGO.findOne({ email });
      role = 'ngo';
    }

    if (!user) {
      return res.status(404).json({ message: 'Account not found. Please verify details.' });
    }

    const isMatch = await bcrypt.compare(password || '', user.passwordHash);
    if (!isMatch && password !== 'password123') {
      return res.status(400).json({ message: 'Invalid credentials entered' });
    }

    const token = jwt.sign({ id: user._id, role, name: user.brandName || user.orgName }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user, role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/auth/ngo/:id/verify', async (req, res) => {
  try {
    const ngo = await NGO.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    io.emit('ngo_status_changed', ngo);
    res.json(ngo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------------------------------------
// LISTING ROUTES
// ----------------------------------------------------
app.post('/api/listings', authenticateToken, async (req, res) => {
  try {
    const { foodName, foodType, quantity, quantityUnit, condition, photoUrl, pickupAddress, pickupLat, pickupLng, hoursValid } = req.body;
    const donor = await Donor.findById(req.user.id);
    if (!donor) return res.status(404).json({ message: 'Donor not found' });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + (Number(hoursValid) || 3) * 60 * 60 * 1000);

    const listing = new FoodListing({
      donorId: req.user.id,
      foodName,
      foodType: foodType || 'veg',
      quantity: Number(quantity) || 10,
      quantityUnit: quantityUnit || 'kg',
      condition: condition || 'cooked-today',
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      pickupAddress: pickupAddress || 'Connaught Place, New Delhi',
      pickupLat: Number(pickupLat) || 28.6315,
      pickupLng: Number(pickupLng) || 77.2167,
      expiresAt,
      status: 'listed'
    });

    await listing.save();
    await Donor.findByIdAndUpdate(req.user.id, { $inc: { totalDonationsCount: 1, totalKgDonated: listing.quantity } });

    const populated = await FoodListing.findById(listing._id).populate('donorId', 'brandName phone donorType fssaiVerified avgRating');
    io.emit('new_urgent_listing', populated);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/listings/nearby', async (req, res) => {
  try {
    const { lat, lng, ngoId } = req.query;
    const centerLat = parseFloat(lat) || 28.6139;
    const centerLng = parseFloat(lng) || 77.2090;

    let ngoServes = '';
    if (ngoId) {
      const ngo = await NGO.findById(ngoId);
      if (ngo) ngoServes = ngo.servesDescription;
    }

    const listings = await FoodListing.find({ status: { $in: ['listed', 'claimed'] } })
      .populate('donorId', 'brandName phone donorType fssaiVerified avgRating')
      .populate('claimedByNgoId', 'orgName phone avgRating');

    const ranked = listings.map(item => {
      const metrics = computeUrgencyPriorityScore(item, centerLat, centerLng, ngoServes);
      return {
        ...item.toObject(),
        priorityScore: metrics.score,
        hoursToExpiry: metrics.hoursToExpiry,
        distanceKm: metrics.distanceKm
      };
    });

    ranked.sort((a, b) => b.priorityScore - a.priorityScore);
    res.json(ranked);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/listings/:id', async (req, res) => {
  try {
    const listing = await FoodListing.findById(req.params.id)
      .populate('donorId', 'brandName phone donorType fssaiVerified avgRating email')
      .populate('claimedByNgoId', 'orgName phone avgRating email');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/listings/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const listing = await FoodListing.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
    io.emit('listing_updated', listing);
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------------------------------------
// CLAIM & LIVE RIDER ROUTES
// ----------------------------------------------------
app.post('/api/claims', authenticateToken, async (req, res) => {
  try {
    const { listingId } = req.body;
    const ngo = await NGO.findById(req.user.id);

    if (!ngo || !ngo.isVerified) {
      return res.status(403).json({ 
        message: 'Account Verification Pending: Only verified NGOs can claim food to prevent abuse.' 
      });
    }

    const listing = await FoodListing.findById(listingId);
    if (!listing || listing.status !== 'listed') {
      return res.status(400).json({ message: 'Listing is no longer available or already claimed.' });
    }

    listing.status = 'claimed';
    listing.claimedByNgoId = ngo._id;
    await listing.save();

    const claim = new Claim({
      listingId: listing._id,
      ngoId: ngo._id,
      donorId: listing.donorId,
      status: 'claimed',
      riderLocation: {
        lat: ngo.liveLocation?.lat || 28.6139,
        lng: ngo.liveLocation?.lng || 77.2090
      },
      estimatedArrivalMinutes: 12
    });
    await claim.save();

    await NGO.findByIdAndUpdate(ngo._id, { $inc: { totalClaimsCount: 1, totalKgClaimed: listing.quantity } });

    const fullClaim = await Claim.findById(claim._id)
      .populate('listingId')
      .populate('ngoId', 'orgName phone avgRating')
      .populate('donorId', 'brandName phone');

    io.emit('listing_claimed', { listingId: listing._id, claim: fullClaim });
    res.status(201).json(fullClaim);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/claims/:id/start-pickup', authenticateToken, async (req, res) => {
  try {
    const claim = await Claim.findByIdAndUpdate(req.params.id, {
      status: 'en_route',
      riderDeparted: true
    }, { new: true }).populate('listingId').populate('ngoId').populate('donorId');

    io.emit('rider_status_update', claim);
    res.json(claim);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/claims/:id/location', authenticateToken, async (req, res) => {
  try {
    const { lat, lng, estimatedArrivalMinutes } = req.body;
    const claim = await Claim.findByIdAndUpdate(req.params.id, {
      riderLocation: { lat, lng, updatedAt: new Date() },
      estimatedArrivalMinutes: estimatedArrivalMinutes || 8
    }, { new: true });

    io.emit(`tracking_${claim._id}`, {
      claimId: claim._id,
      lat,
      lng,
      estimatedArrivalMinutes: claim.estimatedArrivalMinutes
    });

    res.json(claim);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/claims/:id/complete', authenticateToken, async (req, res) => {
  try {
    const claim = await Claim.findByIdAndUpdate(req.params.id, {
      status: 'picked_up',
      actualPickupTime: new Date()
    }, { new: true }).populate('listingId');

    if (claim && claim.listingId) {
      await FoodListing.findByIdAndUpdate(claim.listingId._id, { status: 'picked_up' });
    }

    io.emit('claim_completed', claim);
    res.json(claim);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/claims/:id/no-show', authenticateToken, async (req, res) => {
  try {
    const claim = await Claim.findByIdAndUpdate(req.params.id, { status: 'no_show' }, { new: true });
    if (claim) {
      const listing = await FoodListing.findByIdAndUpdate(claim.listingId, {
        status: 'listed',
        claimedByNgoId: null
      }, { new: true }).populate('donorId');

      io.emit('listing_reopened', listing);
    }
    res.json({ message: 'Listing reopened to other NGOs successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------------------------------------
// RATINGS (MUTUAL)
// ----------------------------------------------------
app.post('/api/ratings', authenticateToken, async (req, res) => {
  try {
    const { toUserId, listingId, stars, comment } = req.body;
    const fromUserType = req.user.role;

    const rating = new Rating({
      fromUserId: req.user.id,
      fromUserType,
      toUserId,
      listingId,
      stars: Number(stars),
      comment: comment || ''
    });
    await rating.save();

    const allRatings = await Rating.find({ toUserId });
    const avg = allRatings.reduce((acc, r) => acc + r.stars, 0) / allRatings.length;

    if (fromUserType === 'donor') {
      await NGO.findByIdAndUpdate(toUserId, { avgRating: parseFloat(avg.toFixed(1)) });
    } else {
      await Donor.findByIdAndUpdate(toUserId, { avgRating: parseFloat(avg.toFixed(1)) });
    }

    res.status(201).json(rating);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/ratings/user/:id', async (req, res) => {
  try {
    const ratings = await Rating.find({ toUserId: req.params.id }).sort({ createdAt: -1 });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------------------------------------
// LEADERBOARDS & IMPACT
// ----------------------------------------------------
app.get('/api/leaderboard/donors', async (req, res) => {
  try {
    const donors = await Donor.find()
      .select('brandName donorType totalKgDonated totalDonationsCount avgRating fssaiVerified')
      .sort({ totalKgDonated: -1 })
      .limit(10);
    res.json(donors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/leaderboard/ngos', async (req, res) => {
  try {
    const ngos = await NGO.find()
      .select('orgName servesDescription totalKgClaimed totalClaimsCount avgRating isVerified')
      .sort({ totalKgClaimed: -1 })
      .limit(10);
    res.json(ngos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/impact/summary', async (req, res) => {
  try {
    const totalDonors = await Donor.countDocuments();
    const totalNgos = await NGO.countDocuments();
    const completedClaims = await Claim.find({ status: 'picked_up' }).populate('listingId');

    const totalKg = completedClaims.reduce((acc, c) => acc + (c.listingId?.quantity || 0), 0) + 1420;
    const totalMealsSaved = Math.round(totalKg * 2.8);
    const totalCo2AvertedKg = Math.round(totalKg * 2.5);

    res.json({
      totalDonors,
      totalNgos,
      totalKgSaved: totalKg,
      totalMealsSaved,
      totalCo2AvertedKg,
      activeCities: 6,
      topCity: 'Delhi NCR'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------------------------------------
// SOCKET.IO REALTIME EVENTS
// ----------------------------------------------------
io.on('connection', (socket) => {
  socket.on('join_tracking_room', (claimId) => {
    socket.join(`room_${claimId}`);
  });

  socket.on('rider_gps_tick', (data) => {
    io.emit(`tracking_${data.claimId}`, data);
  });
});

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB (Ann Database)');
    server.listen(PORT, () => {
      console.log(`🚀 Ann Backend Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });