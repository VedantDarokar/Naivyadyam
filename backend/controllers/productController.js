const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const memoryStore = require('../config/memoryStore');

const isDbReady = () => mongoose.connection.readyState === 1;

// @desc Fetch all products with filter, search, sort, pagination
// @route GET /api/products
const getProducts = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 12;
    const page = Number(req.query.page) || Number(req.query.pageNumber) || 1;

    if (isDbReady()) {
      const query = {};

      if (req.query.keyword) {
        query.$or = [
          { title: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } },
          { brand: { $regex: req.query.keyword, $options: 'i' } },
          { tags: { $regex: req.query.keyword, $options: 'i' } }
        ];
      }

      if (req.query.category) {
        query.category = { $regex: req.query.category, $options: 'i' };
      }
      if (req.query.subcategory) {
        query.subcategory = { $regex: req.query.subcategory, $options: 'i' };
      }
      if (req.query.brand) {
        query.brand = { $regex: req.query.brand, $options: 'i' };
      }
      if (req.query.isFeatured === 'true') query.isFeatured = true;
      if (req.query.isDealOfDay === 'true') query.isDealOfDay = true;

      const minPrice = Number(req.query.minPrice) || 0;
      const maxPrice = Number(req.query.maxPrice) || 1000000;
      query.price = { $gte: minPrice, $lte: maxPrice };

      let sort = { createdAt: -1 };
      if (req.query.sortBy === 'price_asc' || req.query.sort === 'price-asc') sort = { price: 1 };
      else if (req.query.sortBy === 'price_desc' || req.query.sort === 'price-desc') sort = { price: -1 };
      else if (req.query.sortBy === 'rating') sort = { 'ratings.average': -1 };
      else if (req.query.sortBy === 'popular') sort = { 'ratings.count': -1 };

      const count = await Product.countDocuments(query);
      const products = await Product.find(query).sort(sort).limit(pageSize).skip(pageSize * (page - 1));

      return res.json({
        products,
        total: count,
        totalProducts: count,
        page,
        pages: Math.ceil(count / pageSize) || 1
      });
    } else {
      // Memory Store fallback
      let list = [...memoryStore.products];

      if (req.query.keyword) {
        const kw = req.query.keyword.toLowerCase();
        list = list.filter(p => p.title.toLowerCase().includes(kw) || p.description.toLowerCase().includes(kw));
      }
      if (req.query.category) {
        const cat = req.query.category.toLowerCase();
        list = list.filter(p => p.category && p.category.toLowerCase().includes(cat));
      }
      if (req.query.subcategory) {
        const sub = req.query.subcategory.toLowerCase();
        list = list.filter(p => p.subcategory && p.subcategory.toLowerCase().includes(sub));
      }
      if (req.query.isFeatured === 'true') list = list.filter(p => p.isFeatured);
      if (req.query.isDealOfDay === 'true') list = list.filter(p => p.isDealOfDay);

      if (req.query.sortBy === 'price_asc') list.sort((a, b) => a.price - b.price);
      else if (req.query.sortBy === 'price_desc') list.sort((a, b) => b.price - a.price);

      const count = list.length;
      const paginated = list.slice((page - 1) * pageSize, page * pageSize);

      return res.json({
        products: paginated,
        total: count,
        totalProducts: count,
        page,
        pages: Math.ceil(count / pageSize) || 1
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Fetch single product by Slug or ID
// @route GET /api/products/:slugOrId
const getProductBySlugOrId = async (req, res) => {
  try {
    if (isDbReady()) {
      let product;
      if (req.params.slugOrId.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(req.params.slugOrId);
      }
      if (!product) {
        product = await Product.findOne({ slug: req.params.slugOrId });
      }

      if (product) {
        const relatedProducts = await Product.find({ category: product.category, _id: { $ne: product._id } }).limit(4);
        return res.json({ product, relatedProducts });
      }
    } else {
      let product = memoryStore.products.find(p => p.slug === req.params.slugOrId || p._id === req.params.slugOrId);
      if (product) {
        const relatedProducts = memoryStore.products.filter(p => p.category === product.category && p._id !== product._id).slice(0, 4);
        return res.json({ product, relatedProducts });
      }
    }
    res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Submit Review
// @route POST /api/products/:id/reviews
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (isDbReady()) {
      const product = await Product.findById(req.params.id);
      if (product) {
        const review = {
          user: req.user._id,
          userName: req.user.name,
          userAvatar: req.user.avatar || '',
          rating: Number(rating),
          comment
        };
        product.reviews.push(review);
        product.ratings.count = product.reviews.length;
        product.ratings.average = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
        await product.save();
        return res.status(201).json({ message: 'Review added', product });
      }
    }
    res.status(400).json({ message: 'Product not found or DB not connected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all categories
// @route GET /api/products/categories/all
const getCategories = async (req, res) => {
  try {
    if (isDbReady()) {
      const categories = await Category.find({});
      return res.json(categories);
    } else {
      return res.json(memoryStore.categories);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create new product (Admin)
// @route POST /api/products
const createProduct = async (req, res) => {
  try {
    if (isDbReady()) {
      const product = new Product({
        ...req.body,
        slug: req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sku: req.body.sku || `NV-${Date.now()}`
      });
      const createdProduct = await product.save();
      return res.status(201).json(createdProduct);
    } else {
      const newProduct = {
        _id: `prd_${Date.now()}`,
        ...req.body,
        slug: req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sku: req.body.sku || `NV-${Date.now()}`
      };
      memoryStore.products.push(newProduct);
      return res.status(201).json(newProduct);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update product (Admin)
// @route PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    if (isDbReady()) {
      let product = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        product = await Product.findById(id);
      }
      if (!product) {
        product = await Product.findOne({
          $or: [
            { slug: id },
            { sku: id },
            { title: req.body.title }
          ]
        });
      }

      if (product) {
        Object.assign(product, req.body);
        const updatedProduct = await product.save();
        return res.json(updatedProduct);
      } else {
        // Fallback upsert if seed IDs changed
        const newProd = new Product({
          ...req.body,
          slug: req.body.slug || req.body.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          sku: req.body.sku || `NV-${Date.now()}`
        });
        const saved = await newProd.save();
        return res.json(saved);
      }
    } else {
      let index = memoryStore.products.findIndex(p => p._id?.toString() === id || p.slug === id || p.title === req.body.title);
      if (index !== -1) {
        Object.assign(memoryStore.products[index], req.body);
        return res.json(memoryStore.products[index]);
      } else {
        const newProd = { _id: id, ...req.body };
        memoryStore.products.push(newProd);
        return res.json(newProd);
      }
    }
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete product (Admin)
// @route DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    if (isDbReady()) {
      let product = null;
      if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        product = await Product.findById(req.params.id);
      }
      if (!product) {
        product = await Product.findOne({ $or: [{ slug: req.params.id }, { sku: req.params.id }] });
      }

      if (product) {
        await product.deleteOne();
        return res.json({ message: 'Product removed' });
      }
    } else {
      const index = memoryStore.products.findIndex(p => p._id?.toString() === req.params.id?.toString() || p.slug === req.params.id || p.id === req.params.id);
      if (index !== -1) {
        memoryStore.products.splice(index, 1);
        return res.json({ message: 'Product removed' });
      }
    }
    res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductBySlugOrId,
  createProductReview,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct
};
