const express = require("express");
const router = express.Router();
const { handleStripeWebhook,getAllStripePaymentsWithCompanies  } = require("../controllers/stripeWebhookController");

router.post("/", handleStripeWebhook);
router.get("/payments", getAllStripePaymentsWithCompanies);
module.exports = router;
