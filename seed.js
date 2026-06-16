const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
// Load environment variables
dotenv.config();
const sampleProducts = [
  // Electronics (10 items)
  {
    name: "Wireless ANC Headphones",
    description: "High-fidelity sound with advanced active noise cancelling and 40-hour battery life.",
    price: 14999.00,
    discount: 15,
    category: "Electronics",
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "RGB Mechanical Keyboard",
    description: "Tactile mechanical switches, customizable RGB backlighting, and premium aluminum build.",
    price: 9999.00,
    discount : 25,
    category: "Electronics",
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Smart Sports Watch",
    description: "Track fitness activity, heart rate, sleep quality, and receive notifications with 7-day battery life.",
    price: 6999.00,
    discount : 35,
    category: "Electronics",
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Wireless Gaming Mouse",
    description: "Ultra-fast response time, ergonomic grip, and adjustable DPI settings with long battery life.",
    price: 4500.00,
    discount : 30,
    category: "Electronics",
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Curved Gaming Monitor",
    description: "32-inch immersive curved screen, 144Hz refresh rate, and 1ms response time for fluid gaming.",
    price: 24999.00,
    discount : 28,
    category: "Electronics",
    stock: 8,
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Portable Bluetooth Speaker",
    description: "Powerful stereo sound, IPX7 waterproof rating, and 20-hour playtime for outdoor music.",
    price: 5999.00,
    category: "Electronics",
    stock: 35,
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Noise-Isolating Earbuds",
    description: "Compact wireless earbuds featuring punchy bass, clear calls, and touch control interfaces.",
    price: 3499.00,
    category: "Electronics",
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "4K HD Streaming Webcam",
    description: "Auto-focus wide-angle lens, dual microphones, and integrated ring light for stream quality.",
    price: 4999.00,
    category: "Electronics",
    stock: 18,
    imageUrl: "https://images.unsplash.com/photo-1612444530582-fc66183b16f7?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Ergonomic Vertical Mouse",
    description: "Specifically shaped to reduce wrist strain, featuring soft-grip surface and adjustable controls.",
    price: 3200.00,
    category: "Electronics",
    stock: 22,
    imageUrl: "https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Dual Band Wi-Fi Router",
    description: "High-speed wireless internet router with 4 external antennas for max signal coverage.",
    price: 7999.00,
    category: "Electronics",
    stock: 12,
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60"
  },

  // Accessories (10 items)
  {
    name: "Minimalist Leather Wallet",
    description: "Ultra-slim front pocket bifold crafted from full-grain leather with RFID protection.",
    price: 1499.00,
    discount : 31,
    category: "Accessories",
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1627124765135-5657d9d2908a?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Classic Aviator Sunglasses",
    description: "Polarized lenses with durable metal alloy frame, providing 100% UV radiation shielding.",
    price: 4500.00,
    discount : 11,
    category: "Accessories",
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Waterproof Travel Backpack",
    description: "Multi-compartment backpack with padded laptop pocket and USB charging port interface.",
    price: 3999.00,
    discount : 22,
    category: "Accessories",
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Stainless Steel Flask",
    description: "Double-walled vacuum insulated bottle, keeping drinks cold for 24h or hot for 12h.",
    price: 1200.00,
    discount : 27,
    category: "Accessories",
    stock: 60,
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Leather Laptop Sleeve",
    description: "Premium padded notebook envelope with soft lining and magnetic closure.",
    price: 1999.00,
    category: "Accessories",
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Unisex Wool Beanie",
    description: "Stretchy ribbed knit skull cap made from soft merino wool for winter warmth.",
    price: 999.00,
    category: "Accessories",
    stock: 45,
    imageUrl: "https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Adjustable Canvas Belt",
    description: "Heavy-duty military style woven strap with solid matte black metal D-ring buckle.",
    price: 799.00,
    category: "Accessories",
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1624222247344-550fb8ec5521?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Compact Travel Umbrella",
    description: "Windproof folding umbrella featuring auto open-close and reinforced fiberglass ribs.",
    price: 1199.00,
    category: "Accessories",
    stock: 35,
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13edd793be?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Protective Phone Case",
    description: "Shock-absorbing clear armor case with scratch-resistant back panel and raised bezels.",
    price: 899.00,
    category: "Accessories",
    stock: 80,
    imageUrl: "https://images.unsplash.com/photo-1601597111158-2fceff270190?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Magnetic Key Organizer",
    description: "Premium leather key holder that eliminates jingling and fits up to 8 standard keys.",
    price: 1499.00,
    discount : 17,
    category: "Accessories",
    stock: 24,
    imageUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500&auto=format&fit=crop&q=60"
  },

  // Clothing (10 items)
  {
    name: "Classic Crewneck Tee",
    description: "Soft combed cotton t-shirt with reinforced stitching for everyday durability.",
    price: 999.00,
    discount : 9,
    category: "Clothing",
    stock: 100,
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Slim Fit Denim Jeans",
    description: "Stretch denim trousers with classic five-pocket styling and tapered legs.",
    price: 2499.00,
    discount : 45,
    category: "Clothing",
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Premium Hooded Sweatshirt",
    description: "Heavyweight French terry pullover with double-layer hood and kangaroo pocket.",
    price: 2999.00,
    discount : 58,
    category: "Clothing",
    stock: 35,
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Breathable Running Shorts",
    description: "Lightweight moisture-wicking active shorts with built-in mesh liner and key pocket.",
    price: 1299.00,
    discount : 67,
    category: "Clothing",
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Cotton Flannel Shirt",
    description: "Warm checkered button-up shirt crafted from pre-shrunk brushed cotton flannel.",
    price: 1899.00,
    discount : 78,
    category: "Clothing",
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Fleece-Lined Winter Parka",
    description: "Waterproof windproof outerwear jacket with thermal insulation and faux-fur trim hood.",
    price: 7999.00,
    category: "Clothing",
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Athletic Crew Socks (3-Pack)",
    description: "Padded sports socks with arch compression support and moisture control fabrics.",
    price: 599.00,
    category: "Clothing",
    stock: 120,
    imageUrl: "https://images.unsplash.com/photo-1582966772680-860e372bb558?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Waterproof Windbreaker",
    description: "Packable lightweight shell jacket with adjustable hood and zippered pockets.",
    price: 3499.00,
    category: "Clothing",
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Linen Summer Dress",
    description: "Flowy sleeveless dress made from cool breathable linen, perfect for warm weather.",
    price: 2299.00,
    category: "Clothing",
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Premium Jogger Pants",
    description: "Slim-fit tapered lounge pants with elastic drawstring waist and zippered ankle cuffs.",
    price: 1599.00,
    category: "Clothing",
    stock: 45,
    imageUrl: "https://images.unsplash.com/photo-1551854838-212c50b4c184?w=500&auto=format&fit=crop&q=60"
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shop');
    console.log('Connected to MongoDB to seed data...');
    
    await Product.deleteMany({});
    console.log('Cleared existing products.');
    
    await Product.insertMany(sampleProducts);
    console.log('Inserted 30 INR categorized products successfully!');
    
    mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDB();
