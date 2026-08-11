const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true }
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  subcategories: [subcategorySchema]
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
