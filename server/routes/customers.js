const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// Get farmer's customers
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    const customers = await Customer.find({ farmerId }).sort({ lastPurchaseDate: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Add new customer
router.post('/add', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add customer' });
  }
});

module.exports = router;