require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
const PORT = 3000;

// Serve your website files
app.use(express.static(path.join(__dirname, "..")));

// Read form data
app.use(express.urlencoded({ extended: true }));

// Gmail setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Contact form
app.get("/api/products", (req, res) => {
  const productPath = path.join(__dirname,'data', 'product.json');
  const products = JSON.parse(fs.readFileSync(productPath, "utf8"));

  res.json(products);
});
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send("Please fill in your name, email, and message.");
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      replyTo: email,
      subject: `New message from ${name} - Joy Web Design`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    });

    console.log("Email sent successfully!");
    res.send("Thank you! Your message has been received.");
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).send("Sorry, your message could not be sent.");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});