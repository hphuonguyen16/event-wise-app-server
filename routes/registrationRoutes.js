const registrationController = require("../controllers/registrationController");
const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

//regis

router.use(authController.protect);

router
  .route("/bulk-refund")
  .post(authController.protect, registrationController.bulkRefundRegistrations);

router
  .route("/my-registrations")
  .get(registrationController.getMyRegistrations);

router
  .route("/")
  .get(registrationController.getAllRegistrations)
  .post(authController.protect, registrationController.createRegistration);

router
  .route("/:id")
  .get(registrationController.getRegistration)
  .put(registrationController.updateRegistration)
  .delete(registrationController.deleteRegistration)
  .put(authController.protect, registrationController.refundRegistration);

router
  .route("/:id/refund")
  .put(authController.protect, registrationController.refundRegistration);

router
  .route("/:id/check-in")
  .get(authController.protect, registrationController.checkIn);

router.route("/seating").post(registrationController.createSeatingRegistration);

module.exports = router;
