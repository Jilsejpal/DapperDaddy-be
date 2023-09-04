const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

const dotenv = require("dotenv");
//
dotenv.config({ path: "config/config.env" });

const errorMiddleware = require("./middleware/error");

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true })); // support encoded bodies (for forms with
app.use(fileUpload());

// Route Imports
const product = require("./routes/productRoute");
const user = require("./routes/userRoutes");
const order = require("./routes/oderRoute");
const payment = require("./routes/paymentRoute");
const banner = require("./routes/bannerRoute");
const coupon = require("./routes/couponRoute");

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", payment);
app.use("/api/v1", banner);
app.use("/api/v1", coupon);
app.use("/", (req, res) => {
  return res.send("hello");
});

// middleware for error
app.use(errorMiddleware);

module.exports = app;
