import 'dotenv/config';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import BuyerProfile from '../models/BuyerProfile.js';
import SupplierProfile from '../models/SupplierProfile.js';
import Product from '../models/Product.js';
import Board from '../models/Board.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';

const fabrics = [
  {
    name: 'Airy Poplin Soft Cotton',
    category: 'Cotton',
    description: 'Breathable shirting poplin with clean hand-feel for summer programs.',
    colors: ['Ivory', 'Navy', 'Sky'],
    specifications: {
      composition: '100% Cotton',
      gsm: 110,
      width: '58 inch',
      weave: 'Plain',
      finish: 'Mercerized',
      handFeel: 'Soft & crisp',
    },
    stock: 2400,
    price: 185,
    featured: true,
  },
  {
    name: 'Stonewash Midweight Denim',
    category: 'Denim',
    description: 'Reliable midweight denim for bottoms with even indigo cast.',
    colors: ['Indigo', 'Black'],
    specifications: {
      composition: '98% Cotton 2% Elastane',
      gsm: 320,
      width: '60 inch',
      weave: 'Twill',
      finish: 'Stonewash',
      handFeel: 'Structured',
    },
    stock: 900,
    price: 420,
    featured: true,
  },
  {
    name: 'Belgian Linen Open Weave',
    category: 'Linen',
    description: 'Open-weave linen with dry hand — ideal for resort and jackets.',
    colors: ['Natural', 'Olive', 'Sand'],
    specifications: {
      composition: '100% Linen',
      gsm: 180,
      width: '55 inch',
      weave: 'Plain',
      finish: 'Enzyme washed',
      handFeel: 'Dry & airy',
    },
    stock: 650,
    price: 560,
    featured: true,
  },
  {
    name: 'Mulberry Silk Habotai',
    category: 'Silk',
    description: 'Lightweight habotai for linings and elevated blouses.',
    colors: ['Champagne', 'Black', 'Burgundy'],
    specifications: {
      composition: '100% Mulberry Silk',
      gsm: 70,
      width: '44 inch',
      weave: 'Plain',
      finish: 'Degummed',
      handFeel: 'Fluid & lustrous',
    },
    stock: 320,
    price: 980,
    featured: true,
  },
  {
    name: 'Merino Suiting Twill',
    category: 'Wool',
    description: 'Fine merino suiting with smooth drape for tailored programs.',
    colors: ['Charcoal', 'Navy', 'Camel'],
    specifications: {
      composition: '100% Merino Wool',
      gsm: 240,
      width: '58 inch',
      weave: 'Twill',
      finish: 'Clear cut',
      handFeel: 'Smooth',
    },
    stock: 480,
    price: 890,
    featured: false,
  },
  {
    name: 'Performance Recycled Polyester',
    category: 'Synthetics',
    description: 'Recycled polyester with moisture management for athleisure.',
    colors: ['Black', 'Grey', 'Electric Blue'],
    specifications: {
      composition: '100% Recycled Polyester',
      gsm: 150,
      width: '60 inch',
      weave: 'Knit jersey',
      finish: 'Wicking',
      handFeel: 'Smooth stretch',
    },
    stock: 1800,
    price: 210,
    featured: false,
  },
  {
    name: 'Cotton-Linen Summer Blend',
    category: 'Blends',
    description: 'Relaxed blend with linen character and cotton softness.',
    colors: ['Ecru', 'Sage', 'Dusty Rose'],
    specifications: {
      composition: '55% Cotton 45% Linen',
      gsm: 160,
      width: '56 inch',
      weave: 'Plain',
      finish: 'Garment wash ready',
      handFeel: 'Relaxed',
    },
    stock: 1100,
    price: 295,
    featured: true,
  },
  {
    name: 'Organic Slub Jersey',
    category: 'Cotton',
    description: 'Organic cotton slub jersey for elevated basics.',
    colors: ['Off-white', 'Heather Grey', 'Forest'],
    specifications: {
      composition: '100% Organic Cotton',
      gsm: 180,
      width: '60 inch',
      weave: 'Single jersey',
      finish: 'Bio-washed',
      handFeel: 'Soft slub',
    },
    stock: 15,
    price: 240,
    featured: false,
  },
  {
    name: 'Heavy Canvas Workwear',
    category: 'Cotton',
    description: 'Dense canvas for bags and workwear with durable hand.',
    colors: ['Khaki', 'Black', 'Raw'],
    specifications: {
      composition: '100% Cotton',
      gsm: 420,
      width: '58 inch',
      weave: 'Plain',
      finish: 'Unfinished greige option',
      handFeel: 'Firm',
    },
    stock: 700,
    price: 310,
    featured: false,
  },
  {
    name: 'Cupro Fluid Twill',
    category: 'Synthetics',
    description: 'Cupro twill with silk-like drape for dresses and shirts.',
    colors: ['Ivory', 'Ink', 'Rust'],
    specifications: {
      composition: '100% Cupro',
      gsm: 130,
      width: '54 inch',
      weave: 'Twill',
      finish: 'Peach touch',
      handFeel: 'Fluid',
    },
    stock: 540,
    price: 470,
    featured: true,
  },
  {
    name: 'Flannel Brushed Yarn Dye',
    category: 'Cotton',
    description: 'Yarn-dyed flannel with soft brush for winter shirts.',
    colors: ['Buffalo Check', 'Navy Windowpane'],
    specifications: {
      composition: '100% Cotton',
      gsm: 160,
      width: '58 inch',
      weave: 'Plain',
      finish: 'Double brushed',
      handFeel: 'Warm soft',
    },
    stock: 860,
    price: 265,
    featured: false,
  },
  {
    name: 'Technical Ripstop Nylon',
    category: 'Synthetics',
    description: 'Lightweight ripstop for outer shells and packable layers.',
    colors: ['Black', 'Olive', 'Storm'],
    specifications: {
      composition: '100% Nylon',
      gsm: 90,
      width: '60 inch',
      weave: 'Ripstop',
      finish: 'DWR',
      handFeel: 'Crisp light',
    },
    stock: 1200,
    price: 330,
    featured: false,
  },
];

async function seed() {
  await connectDB(process.env.MONGODB_URI);

  await Promise.all([
    User.deleteMany({}),
    BuyerProfile.deleteMany({}),
    SupplierProfile.deleteMany({}),
    Product.deleteMany({}),
    Board.deleteMany({}),
    Cart.deleteMany({}),
    Order.deleteMany({}),
  ]);

  const buyer = await User.create({
    name: 'Asha Buyer',
    email: 'buyer@greige.demo',
    password: 'password123',
    role: 'buyer',
    onboardingComplete: true,
  });

  const supplier = await User.create({
    name: 'Mill House Supplier',
    email: 'mill@greige.demo',
    password: 'password123',
    role: 'supplier',
    onboardingComplete: true,
  });

  await BuyerProfile.create({
    user: buyer._id,
    businessType: 'Apparel brand',
    industry: 'Fashion',
    categoriesOfInterest: ['Cotton', 'Linen', 'Blends'],
    preferredFabricTypes: ['Poplin', 'Linen', 'Jersey'],
    typicalOrderQuantity: '500-2000 meters',
    budgetRange: '₹150-600 / meter',
  });

  await SupplierProfile.create({
    user: supplier._id,
    businessName: 'Mill House Textiles',
    businessType: 'Fabric mill',
    contactPhone: '+91 98765 43210',
    contactEmail: 'mill@greige.demo',
    address: {
      line1: '12 Loom Road',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      country: 'India',
      postalCode: '641001',
    },
    operatingHours: 'Mon–Sat 9:00–18:00 IST',
    productCategories: ['Cotton', 'Linen', 'Denim', 'Silk', 'Wool', 'Synthetics', 'Blends'],
    fabricTypesOffered: ['Poplin', 'Twill', 'Jersey', 'Canvas', 'Habotai'],
    moq: '200 meters',
  });

  const products = await Product.insertMany(
    fabrics.map((f) => ({
      ...f,
      supplier: supplier._id,
      unit: 'meters',
      currency: 'INR',
      images: [],
      status: f.stock > 0 ? 'available' : 'out_of_stock',
    }))
  );

  await Board.create({
    buyer: buyer._id,
    name: 'SS27 Shirting shortlist',
    products: products.slice(0, 4).map((p) => p._id),
  });

  console.log('Seeded GREIGE demo data');
  console.log('Buyer: buyer@greige.demo / password123');
  console.log('Supplier: mill@greige.demo / password123');
  console.log(`Products: ${products.length}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
