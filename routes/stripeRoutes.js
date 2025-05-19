const express = require('express');
const router = express.Router();
const { createCheckoutSession} = require('../controllers/stripeController');

router.post('/create-checkout-session', createCheckoutSession);
// GET all Stripe payments with company info and total


module.exports = router;
