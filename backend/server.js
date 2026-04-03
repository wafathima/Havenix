const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const fs = require('fs');
const path = require('path');
const http = require('http'); 
const { initializeSocket } = require('./socket'); 
const propertyRoutes = require("./routes/user/propertyRoutes");
const enquiryRoutes = require("./routes/user/enquiryRoutes");
const chatRoutes = require("./routes/user/chatRoutes"); 
const reviewRoutes = require("./routes/user/reviewRoutes");
const projectRoutes = require('./routes/builder/projectRoutes');
const expenseRoutes = require('./routes/builder/expenseRoutes');
const trackingRoutes = require('./routes/builder/trackingRoutes');
const notificationRoutes = require("./routes/user/notificationRoutes");
const builderPropertyRoutes = require("./routes/builder/propertyRoutes");
const sellerPropertyPurchaseRoutes = require("./routes/seller/propertyPurchaseRoutes");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);

app.use(cors({
  origin: "http://localhost:4000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(__dirname, 'uploads/profile');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const projectsUploadDir = path.join(__dirname, 'uploads/projects');
if (!fs.existsSync(projectsUploadDir)) {
  fs.mkdirSync(projectsUploadDir, { recursive: true });
}

const expenseUploadDir = path.join(__dirname, 'uploads/expenses');
if (!fs.existsSync(expenseUploadDir)) {
  fs.mkdirSync(expenseUploadDir, { recursive: true });
  console.log('✅ Expense receipts upload directory created');
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/user", require("./routes/user/authRoutes"));
app.use("/api/admin", require("./routes/admin/adminAuthRoutes"));
app.use("/api/properties", propertyRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/seller/properties", require("./routes/seller/propertyRoutes"));
app.use("/api/users", require("./routes/user/userRoutes"));
app.use("/api/reviews", reviewRoutes);
app.use("/api/auth", require("./routes/user/authRoutes"));
app.use("/api/admin", require("./routes/admin/adminRoutes"));
app.use("/api/notifications", notificationRoutes);
app.use("/api/enquiries", require("./routes/user/enquiryRoutes"));
app.use("/api/builder/properties", builderPropertyRoutes);
app.use("/api/seller/properties/purchased", sellerPropertyPurchaseRoutes);
app.use("/api/purchase-requests", require("./routes/seller/propertyPurchaseRoutes"));
app.use("/api/purchase-requests", require("./routes/seller/purchaseRequestRoutes"));
app.use("/api/seller/builder", require("./routes/seller/builderRoutes"));


app.use("/api/builder/expenses", expenseRoutes);
app.use("/api/builder/tracking", trackingRoutes);

app.use("/api/builder", projectRoutes);

app.get("/", (req, res) => {
  res.send("Havenix API is running...");
});

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`✅ Expense routes mounted at /api/builder/expenses`);
  console.log(`✅ Tracking routes mounted at /api/builder/tracking`);
  console.log(`✅ Project routes mounted at /api/builder`);
});