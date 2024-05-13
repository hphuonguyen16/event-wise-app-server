const express = require("express");

const router = express.Router();
const transactionController = require("../controllers/transactionController");
const authController = require("./../controllers/authController");
const eventController = require("./../controllers/eventController");

router.get("/vnpay_ipn", transactionController.executeTransaction);
router.get("/vnpay_return", transactionController.return);
router
  .route("/all")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    transactionController.getAllTransactions
  );

// router
//   .route("/:id")
//   .get(
//     authController.protect,
//     authController.restrictTo("admin", "business"),
//     transactionController.getTransactionsByBusiness
//   );

router.post(
  "/deposit",
  authController.protect,
  //authController.restrictTo("business", "admin"),
  transactionController.createTransactionDeposit
);

// router.get('/get-events', eventController.getAllEvents)

module.exports = router;
