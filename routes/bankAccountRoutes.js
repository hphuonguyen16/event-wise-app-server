const express = require("express");

const router = express.Router();
const authController = require("./../controllers/authController");
const bankAccountController = require("./../controllers/bankAccountController");

router.use(authController.protect);
router.route("/me").get(bankAccountController.getMyBankAccount).post(bankAccountController.createOrUpdateBankAccount);

// router.get('/get-events', eventController.getAllEvents)

module.exports = router;
