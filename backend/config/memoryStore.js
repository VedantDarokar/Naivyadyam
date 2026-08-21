const bcrypt = require('bcryptjs');

class MemoryStore {
  constructor() {
    this.users = [];
    this.products = [];
    this.categories = [];
    this.coupons = [];
    this.orders = [];
    this.tickets = [];
    this.initialized = false;
  }

  async seed() {
    if (this.initialized) return;

    this.categories = [
      {
        _id: 'cat_1',
        name: 'Instant Premix',
        slug: 'instant-premix',
        image: '/product-idli.jpg',
        description: 'Traditional Indian instant premix — just add water and cook in minutes.'
      }
    ];

    const adminHash = await bcrypt.hash('adminpassword123', 10);
    const userHash = await bcrypt.hash('password123', 10);

    this.users = [
      {
        _id: 'usr_admin_1',
        name: 'Naivadyam Admin',
        email: 'admin@naivadyam.com',
        password: adminHash,
        role: 'admin',
        phone: '8149471804',
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=7B1A1A&color=F5C518&bold=true',
        isVerified: true,
        createdAt: new Date()
      }
    ];

    this.products = [
      {
        _id: 'prd_1',
        title: 'Instant Idli Premix',
        slug: 'instant-idli-premix',
        sku: 'NV-IDLI-500',
        description: 'Authentic South Indian Idli Premix made from stone-ground rice and urad dal. Just add water, ferment for 30 minutes, and steam for fluffy, soft idlis.',
        price: 99,
        compareAtPrice: 130,
        category: 'Instant Premix',
        subcategory: 'South Indian Premix',
        brand: 'Naivadyam',
        images: ['/product-idli.jpg'],
        stock: 150,
        weight: '500g',
        isFeatured: true,
        isDealOfDay: true,
        discountPercentage: 24,
        ratings: { average: 4.8, count: 324 },
        createdAt: new Date()
      },
      {
        _id: 'prd_2',
        title: 'Instant Medu Wada Premix',
        slug: 'instant-medu-wada-premix',
        sku: 'NV-WADA-400',
        description: 'Crispy, golden Medu Wadas in just 15 minutes! Made from premium urad dal with traditional spices.',
        price: 89,
        compareAtPrice: 115,
        category: 'Instant Premix',
        subcategory: 'South Indian Premix',
        brand: 'Naivadyam',
        images: ['/product-meduwada.jpg'],
        stock: 120,
        weight: '400g',
        isFeatured: true,
        isDealOfDay: false,
        discountPercentage: 22,
        ratings: { average: 4.7, count: 198 },
        createdAt: new Date()
      },
      {
        _id: 'prd_3',
        title: 'Instant Dhokla Premix',
        slug: 'instant-dhokla-premix',
        sku: 'NV-DHOKLA-400',
        description: 'Fluffy, spongy Gujarati Dhokla in under 20 minutes! Made with chickpea batter and spices.',
        price: 79,
        compareAtPrice: 105,
        category: 'Instant Premix',
        subcategory: 'Gujarati Premix',
        brand: 'Naivadyam',
        images: ['/product-dhokla.jpg'],
        stock: 180,
        weight: '400g',
        isFeatured: true,
        isDealOfDay: true,
        discountPercentage: 25,
        ratings: { average: 4.9, count: 412 },
        createdAt: new Date()
      },
      {
        _id: 'prd_4',
        title: 'Instant Chakli Bhajni',
        slug: 'instant-chakli-bhajni',
        sku: 'NV-CHAKLI-500',
        description: 'Traditional Maharashtrian Chakli Bhajni multi-grain flour blend for making crispy chaklis at home.',
        price: 89,
        compareAtPrice: 120,
        category: 'Instant Premix',
        subcategory: 'Maharashtrian Premix',
        brand: 'Naivadyam',
        images: ['/product-chakli.jpg'],
        stock: 200,
        weight: '500g',
        isFeatured: true,
        isDealOfDay: true,
        discountPercentage: 26,
        ratings: { average: 4.9, count: 567 },
        createdAt: new Date()
      }
    ];

    this.coupons = [
      {
        _id: 'cpn_1',
        code: 'NAIVADYAM10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 199,
        maxDiscount: 150,
        usageLimit: 1000,
        usedCount: 0,
        isActive: true
      }
    ];

    this.initialized = true;
  }
}

const memoryStore = new MemoryStore();
memoryStore.seed();

module.exports = memoryStore;
