const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Company, User,StripeHistory} = require("../models");
const { sendPremiumConfirmationEmail } = require("../services/emailService"); // adjust path if needed

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Stripe webhook verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // ✅ Safely extract customer email
    const customerEmail =session.customer_email || session.customer_details?.email || null;

    if (!customerEmail) {
      console.error("❌ No customer email found in session.");
      return res.status(400).send("Customer email not provided.");
    }

    try {
      const user = await User.findOne({ where: { email: customerEmail } });
      if (!user) {
        console.error("❌ User not found for email:", customerEmail);
        return res.status(404).send("Payment received, but no matching user. Premium not activated.");
      }

      const company = await Company.findOne({ where: { userId: user.userId } });
      if (!company) {
        console.error("❌ Company not found for user:", user.userId);
        return res.status(404).send("Company not found");
      }
      if (!company.verified) {
        console.log("❌ Company not verified for premium plan.");
        return res.status(403).send("Company not verified");
      }

      const now = new Date();
      const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // exactly 30 days

      await company.update({
        hasPremiumPlan: true,
        premiumSince: now,
        premiumExpires: oneMonthLater,
        jobLimit: 5,
      });

      const amount = session.amount_total
        ? (session.amount_total / 100).toFixed(2)
        : "0.00";

      // ✅ Send email confirmation
      await sendPremiumConfirmationEmail(
        customerEmail,
        company.companyName,
        oneMonthLater,
        amount
      );

      // ✅ Record payment history
      await StripeHistory.create({
        companyId: company.companyId,
        amount,
        currency: session.currency || "usd",
        paidAt: now,
      });

      console.log(`✅ Premium activated + payment recorded for: ${customerEmail}`);
      return res.status(200).json({ received: true, });

    } catch (err) {
      console.error("❌ Error processing Stripe webhook:", err);
      return res.status(500).send("Internal Server Error");
    }
  }

  // ✅ Acknowledge other event types
  return res.status(200).json({ received: true });
};

exports.getAllStripePaymentsWithCompanies = async (req, res) => {
  try {
    // Fetch all payment records with associated company and user info
    const payments = await StripeHistory.findAll({
      include: [
        {
          model: Company,
          as: "company",
          attributes: ["companyId", "companyName"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["email", "imageUrl", "cityId", "countryId"],
            }
          ]
        }
      ],
      order: [["paidAt", "DESC"]],
    });

    // Calculate the total amount across all payments
    const totalAmount = await StripeHistory.sum("amount");

    res.status(200).json({
      totalAmount: parseFloat(totalAmount || 0).toFixed(2),
      payments,
    });
  } catch (error) {
    console.error("❌ Error fetching payments with companies:", error);
    res.status(500).json({
      message: "Failed to fetch payment history with company details",
      error: error.message,
    });
  }
};