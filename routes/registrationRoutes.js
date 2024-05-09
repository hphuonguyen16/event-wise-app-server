const registrationController = require("../controllers/registrationController");
const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

//regis

router.use(authController.protect);

router
  .route("/")
  .get(registrationController.getAllRegistrations)
  .post(authController.protect, registrationController.createRegistration);

router
  .route("/:id")
  .get(registrationController.getRegistration)
  .put(registrationController.updateRegistration)
    .delete(registrationController.deleteRegistration);
  

module.exports = router;