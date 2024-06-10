const express = require("express");
const promoController = require("../controllers/promoController");
const authController = require("../controllers/authController");
const router = express.Router();

router.use(authController.protect);

router
    .route("/")
    .get(promoController.getAllPromos)
    .post(promoController.createPromo);

router
    .route("/:id")
    .get(promoController.getPromo)
    .put(promoController.updatePromo)
    .delete(promoController.deletePromo);

module.exports = router;