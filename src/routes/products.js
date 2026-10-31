const express = require('express');
const path = require('path');
const validateProduct = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = express.Router();

let products = [];
let nextId = 1;

function findProduct(req, res, next) {
  const product = products.find((item) => item.id === Number(req.params.id));

  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  req.product = product;
  next();
}

router.get('/', (req, res) => {
  let result = [...products];
  const { category, minPrice, maxPrice } = req.query;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 10, 1);

  if (category) {
    result = result.filter((product) => product.category === category);
  }

  if (minPrice) {
    result = result.filter((product) => product.price >= Number(minPrice));
  }

  if (maxPrice) {
    result = result.filter((product) => product.price <= Number(maxPrice));
  }

  const total = result.length;
  const start = (page - 1) * limit;

  res.json({
    data: result.slice(start, start + limit),
    total,
    page,
    limit
  });
});

router.get('/:id', findProduct, (req, res) => {
  res.json(req.product);
});

router.post('/', validateProduct, (req, res) => {
  const product = {
    id: nextId++,
    ...req.body,
    createdAt: new Date().toISOString()
  };

  products.push(product);
  res.status(201).json(product);
});

router.put('/:id', findProduct, validateProduct, (req, res) => {
  const updatedProduct = {
    id: req.product.id,
    ...req.body,
    imageUrl: req.product.imageUrl,
    createdAt: req.product.createdAt
  };

  products = products.map((product) => (
    product.id === req.product.id ? updatedProduct : product
  ));

  res.json(updatedProduct);
});

router.patch('/:id', findProduct, (req, res) => {
  const allowedFields = ['name', 'price', 'category', 'stock', 'description'];
  const data = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      data[field] = req.body[field];
    }
  }

  const { error, value } = require('joi').object({
    name: require('joi').string().min(2).max(100),
    price: require('joi').number().positive(),
    category: require('joi').string().valid('electronics', 'clothing', 'food', 'other'),
    stock: require('joi').number().integer().min(0),
    description: require('joi').string().max(500).allow('')
  }).min(1).validate(data, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      error: 'Ошибка валидации',
      details: error.details.map((item) => item.message)
    });
  }

  Object.assign(req.product, value);
  res.json(req.product);
});

router.delete('/:id', findProduct, (req, res) => {
  products = products.filter((product) => product.id !== req.product.id);
  res.status(204).send();
});

router.post('/:id/image', findProduct, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Нужно передать изображение в поле image' });
  }

  req.product.imageUrl = `/uploads/products/${path.basename(req.file.path)}`;
  res.json({ imageUrl: req.product.imageUrl });
});

module.exports = router;
