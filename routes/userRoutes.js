const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");
const router = express.Router();

router.post("/signup", authController.signup1);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get("/refresh", authController.refreshToken);
router.get("/:id/verify/:token", authController.verifyEmail);
router.post("/business/signup", authController.businessSignup);
// router.post('/forgotPassword', authController.forgotPassword);
// router.patch('/resetPassword/:token', authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch("/updateMyPassword", authController.updatePassword);
// router.get('/me', userController.getMe, userController.getUser);
router.get("/me", userController.getMe);
router.get("/checkId/:id", userController.checkMyId);
router.get("/getProfileByID/:id", userController.getProfileByID);
router.put("/updateMe", userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);

router.use(authController.restrictTo("admin"));

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router
  .route("/:id/lock-unlock-account")
  .put(userController.lockOrUnlockAccount);

module.exports = router;
