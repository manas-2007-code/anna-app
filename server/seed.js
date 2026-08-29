const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ann_db';

const DonorSchema = new mongoose.Schema({
  brandName: String, email: String, phone: String, passwordHash: String,
  donorType: String, fssaiNumber: String, fssaiVerified: Boolean,
  avgRating: Number, totalDonationsCount: Number, totalKgDonated: Number
});

const NGOSchema = new mongoose.Schema({
  orgName: String, email: String, phone: String, passwordHash: String,
  servesDescription: String, isVerified: Boolean, avgRating: Number,
  totalClaimsCount: Number, totalKgClaimed: Number, liveLocation: Object
});

const FoodListingSchema = new mongoose.Schema({
  donorId: mongoose.Schema.Types.ObjectId,
  foodName: String, foodType: String, quantity: Number, quantityUnit: String,
  condition: String, photoUrl: String, pickupAddress: String,
  pickupLat: Number, pickupLng: Number, expiresAt: Date, status: String
});

const Donor = mongoose.model('Donor', DonorSchema);
const NGO = mongoose.model('NGO', NGOSchema);
const FoodListing = mongoose.model('FoodListing', FoodListingSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Clearing old data...');
  await Donor.deleteMany({});
  await NGO.deleteMany({});
  await FoodListing.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  console.log('Seeding NGOs...');
  const ngos = await NGO.insertMany([
    {
      orgName: 'Robin Hood Army Delhi',
      email: 'rha@delhi.org',
      phone: '+91 98101 23456',
      passwordHash,
      servesDescription: 'Slum clusters, homeless shelters, 350+ meals nightly',
      isVerified: true,
      avgRating: 4.9,
      totalClaimsCount: 142,
      totalKgClaimed: 2850,
      liveLocation: { lat: 28.6289, lng: 77.2065 }
    },
    {
      orgName: 'Paws & Collars Animal Rescue',
      email: 'paws@feeding.org',
      phone: '+91 98765 43210',
      passwordHash,
      servesDescription: 'Street dogs, animal sanctuaries across South Delhi',
      isVerified: true,
      avgRating: 4.8,
      totalClaimsCount: 98,
      totalKgClaimed: 1640,
      liveLocation: { lat: 28.5355, lng: 77.2410 }
    },
    {
      orgName: 'Goonj Urban Relief',
      email: 'goonj@relief.org',
      phone: '+91 99112 87654',
      passwordHash,
      servesDescription: 'Migrant worker colonies & disaster relief kitchens',
      isVerified: true,
      avgRating: 5.0,
      totalClaimsCount: 210,
      totalKgClaimed: 4200,
      liveLocation: { lat: 28.6139, lng: 77.2295 }
    },
    {
      orgName: 'Annapurna Seva Trust',
      email: 'annapurna@seva.in',
      phone: '+91 98223 11223',
      passwordHash,
      servesDescription: 'Orphanages and senior living care homes',
      isVerified: true,
      avgRating: 4.7,
      totalClaimsCount: 64,
      totalKgClaimed: 1100,
      liveLocation: { lat: 28.6500, lng: 77.2300 }
    },
    {
      orgName: 'FeedTheStreets Foundation',
      email: 'pending@ngo.org',
      phone: '+91 99887 66554',
      passwordHash,
      servesDescription: 'Night volunteer patrol team',
      isVerified: false,
      avgRating: 4.5,
      totalClaimsCount: 12,
      totalKgClaimed: 210,
      liveLocation: { lat: 28.5800, lng: 77.2100 }
    }
  ]);

  console.log('Seeding Donors...');
  const donors = await Donor.insertMany([
    {
      brandName: 'Haldirams Sweets & Caterers',
      email: 'haldirams@cp.com',
      phone: '+91 98110 54321',
      passwordHash,
      donorType: 'restaurant',
      fssaiNumber: '10014011001890',
      fssaiVerified: true,
      avgRating: 4.9,
      totalDonationsCount: 88,
      totalKgDonated: 1750
    },
    {
      brandName: 'The Imperial Grand Banquet',
      email: 'banquets@imperial.com',
      phone: '+91 98220 99887',
      passwordHash,
      donorType: 'restaurant',
      fssaiNumber: '13318005000124',
      fssaiVerified: true,
      avgRating: 5.0,
      totalDonationsCount: 52,
      totalKgDonated: 2400
    },
    {
      brandName: 'BakeHouse Artisans',
      email: 'orders@bakehouse.in',
      phone: '+91 98330 11234',
      passwordHash,
      donorType: 'restaurant',
      fssaiNumber: '10019022003344',
      fssaiVerified: true,
      avgRating: 4.8,
      totalDonationsCount: 30,
      totalKgDonated: 420
    },
    {
      brandName: 'Sharma Household',
      email: 'sharma.home@gmail.com',
      phone: '+91 98440 66778',
      passwordHash,
      donorType: 'household',
      fssaiVerified: false,
      avgRating: 4.7,
      totalDonationsCount: 8,
      totalKgDonated: 65
    }
  ]);

  console.log('Seeding Food Listings...');
  const now = Date.now();
  const sampleListings = [
    {
      donorId: donors[0]._id,
      foodName: 'Dal Makhani & Steamed Rice Buffet Trays',
      foodType: 'veg',
      quantity: 35,
      quantityUnit: 'servings',
      condition: 'cooked-today',
      photoUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d',
      pickupAddress: 'Connaught Place Outer Circle, New Delhi',
      pickupLat: 28.6328,
      pickupLng: 77.2197,
      expiresAt: new Date(now + 45 * 60 * 1000),
      status: 'listed'
    },
    {
      donorId: donors[1]._id,
      foodName: 'Surplus Banquet Feast (Paneer Tikka, Naan & Pulao)',
      foodType: 'veg',
      quantity: 80,
      quantityUnit: 'servings',
      condition: 'fresh',
      photoUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
      pickupAddress: 'Janpath Lane Hotel Corridor, Delhi',
      pickupLat: 28.6219,
      pickupLng: 77.2185,
      expiresAt: new Date(now + 90 * 60 * 1000),
      status: 'listed'
    },
    {
      donorId: donors[2]._id,
      foodName: 'Fresh Whole Wheat Loaves & Croissants',
      foodType: 'bakery',
      quantity: 22,
      quantityUnit: 'packets',
      condition: 'fresh',
      photoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff',
      pickupAddress: 'Khan Market, Shop 42, New Delhi',
      pickupLat: 28.6003,
      pickupLng: 77.2270,
      expiresAt: new Date(now + 5 * 60 * 60 * 1000),
      status: 'listed'
    },
    {
      donorId: donors[0]._id,
      foodName: 'Mixed Curries & Rice Portions',
      foodType: 'mixed',
      quantity: 40,
      quantityUnit: 'kg',
      condition: 'near-expiry',
      photoUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
      pickupAddress: 'Barakhamba Road Metro Plaza',
      pickupLat: 28.6295,
      pickupLng: 77.2280,
      expiresAt: new Date(now + 35 * 60 * 1000),
      status: 'listed'
    },
    {
      donorId: donors[3]._id,
      foodName: 'Homemade Rajma Chawal (Untouched)',
      foodType: 'veg',
      quantity: 12,
      quantityUnit: 'servings',
      condition: 'cooked-today',
      photoUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      pickupAddress: 'Lajpat Nagar Block 3, New Delhi',
      pickupLat: 28.5677,
      pickupLng: 77.2433,
      expiresAt: new Date(now + 3 * 60 * 60 * 1000),
      status: 'listed'
    },
    {
      donorId: donors[1]._id,
      foodName: 'Hyderabadi Chicken Biryani Handi',
      foodType: 'non-veg',
      quantity: 45,
      quantityUnit: 'servings',
      condition: 'cooked-today',
      photoUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8',
      pickupAddress: 'Pragati Maidan Event Grounds, Hall 7',
      pickupLat: 28.6180,
      pickupLng: 77.2420,
      expiresAt: new Date(now + 50 * 60 * 1000),
      status: 'listed'
    }
  ];

  await FoodListing.insertMany(sampleListings);
  console.log('✅ Ann database seeded successfully.');
  process.exit(0);
}

seed();