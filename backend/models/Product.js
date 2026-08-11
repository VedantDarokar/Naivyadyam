const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userAvatar: { type: String, default: '' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const variantSchema = new mongoose.Schema({
  size: { type: String, default: '' },
  color: { type: String, default: '' },
  colorHex: { type: String, default: '#000000' },
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 10 }
});

const specSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true }
});

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, default: '' },
  brand: { type: String, default: 'Naivadyam Premium' },
  price: { type: Number, required: true },
  compareAtPrice: { type: Number, required: true },
  discountPercentage: { type: Number, default: 0 },
  stock: { type: Number, required: true, default: 50 },
  sku: { type: String, required: true },
  images: [{ type: String, required: true }],
  variants: [variantSchema],
  specifications: [specSchema],
  ratings: {
    average: { type: Number, default: 4.5 },
    count: { type: Number, default: 12 }
  },
  reviews: [reviewSchema],
  tags: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  isDealOfDay: { type: Boolean, default: false },
  deliveryEstDays: { type: Number, default: 3 },
  seo: {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' }
  }
}, { timestamps: true });

productSchema.pre('save', function () {
  if (this.compareAtPrice > this.price) {
    this.discountPercentage = Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
  }
});

module.exports = mongoose.model('Product', productSchema);
