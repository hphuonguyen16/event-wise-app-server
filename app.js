const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const multer = require("multer");
const cookieSession = require("cookie-session");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const userRouter = require("./routes/userRoutes");
const eventRouter = require("./routes/eventRoutes");
const ticketTypeRouter = require("./routes/ticketTypeRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const registrationRouter = require("./routes/registrationRoutes");
const transactionRouter = require("./routes/transactionRoutes");
const bankAccountRouter = require("./routes/bankAccountRoutes");
const withdrawalRequestRouter = require("./routes/withdrawalRoutes");
const canvasRouter = require("./routes/canvasRoutes");
const tierRouter = require("./routes/tierRoutes");

const cors = require("cors");

const app = express();
const upload = multer();

app.enable("trust proxy");
app.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);

app.use(
  cors({
    // origin: ["http://localhost:3000", "https://beegin-app.vercel.app"], // Replace with the origin of your client application
    origin: [
      "http://localhost:3000",
      "https://event-wise-app.vercel.app",
      "https://beegin.vercel.app",
    ],
    credentials: true, // Allow credentials (cookies) to be sent
  })
);
app.use(
  cookieSession({
    secret: process.env.JWT_SECRET,
    secure: process.env.NODE_ENV === "development" ? false : true,
    httpOnly: process.env.NODE_ENV === "development" ? false : true,
    sameSite: process.env.NODE_ENV === "development" ? false : "none",
  })
);
// app.set("view engine", "pug");
// app.set("views", path.join(__dirname, "views"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, "public")));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(upload.any());
app.use(express.static("public"));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      // "price",
    ],
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

// 3) ROUTES
app.use("/api/v1/users", userRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/ticket-types", ticketTypeRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/registrations", registrationRouter);
app.use("/api/v1/transactions", transactionRouter);
app.use("/api/v1/bank-accounts", bankAccountRouter);
app.use("/api/v1/withdrawal-requests", withdrawalRequestRouter);
app.use("/api/v1/canvas", canvasRouter);
app.use("/api/v1/tiers", tierRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
