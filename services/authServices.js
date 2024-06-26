const UserModel = require("./../models/userModel");
const ProfileModel = require("./../models/profileModel");
const AppError = require("./../utils/appError");
const crypto = require("crypto");

const { sendEmail } = require("./../utils/sendEmail");

exports.findUserById = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await UserModel.findById(userId).populate("profile");
      if (!user) {
        reject(
          new AppError(
            "The user belonging to this token does no longer exist.",
            404
          )
        );
        return;
      }
      resolve(user);
    } catch (error) {
      reject(error);
    }
  });
};

exports.updateUserRefreshToken = (userId, refreshToken) => {
  return new Promise(async (resolve, reject) => {
    try {
      await UserModel.findByIdAndUpdate(userId, {
        refreshToken: refreshToken,
      });
    } catch (error) {
      reject(error);
    }
  });
};

exports.findUserByRefreshToken = (refreshToken) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await UserModel.find({ refreshToken: refreshToken });
      if (!user) {
        reject(new AppError("User not found", 404));
        return;
      }
      resolve(user);
    } catch (error) {
      reject(error);
    }
  });
};

exports.signup = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.email ||
        !data.password ||
        !data.passwordConfirm ||
        !data.name
      ) {
        reject(new AppError("Please fill in all required fields", 400));
        return;
      } else if (data.password !== data.passwordConfirm) {
        reject(new AppError("Password confirmation is incorrect", 400));
        return;
      } else {
        const verifyToken = crypto.randomBytes(32).toString("hex");
        const user = await UserModel.create({
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
          phonenumber: data.phonenumber,
          password: data.password,
          passwordConfirm: data.passwordConfirm,
          role: data.role,
          verifyToken: verifyToken,
        });
        const profile = await ProfileModel.create({
          firstname: data.firstname,
          lastname: data.lastname,
          name: data.name,
          gender: data.gender,
          avatar: data.avatar,
          address: data.address,
          bio: data.bio,
          birthday: data.birthday,
          social: data.social,
          website: data.website,
          user: user.id,
          slug: data.slug,
        });
        const url = `${process.env.CLIENT_URL}/verify/${user._id}/${verifyToken}`;
        await sendEmail(user.email, "Email Verification", url);
        resolve(user);
      }
    } catch (error) {
      reject(error);
    }
  });
};

exports.login = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { email, password } = data;
      if (!email || !password) {
        reject(new AppError("Please provide email and password!", 400));
        return;
      }
      // 2) Check if user exists && password is correct
      const user = await UserModel.findOne({ email })
        .select("+password")
        .populate("profile");

      if (!user || !(await user.correctPassword(password, user.password))) {
        reject(new AppError("Incorrect email or password", 401));
        return;
      }
      if (user.isActived === false) {
        reject(
          new AppError(
            "Your account has been locked. Please contact us for help",
            401
          )
        );
        return;
      }
      if (!user.verify) {
        if (!user.verifyToken) {
          const verifyToken = crypto.randomBytes(32).toString("hex");
          await UserModel.findByIdAndUpdate(user._id, {
            verifyToken: verifyToken,
          });
          const url = `${process.env.CLIENT_URL}/verify/${user._id}/${verifyToken}`;
          await sendEmail(user.email, "Email Verification", url);
        }
        reject(
          new AppError("An Email sent to your account! Please verify", 401)
        );
        return;
      }
      resolve(user);
    } catch (error) {
      reject(error);
    }
  });
};

exports.verifyToken = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await UserModel.findOne({ _id: userId });
      if (!user) {
        reject(new AppError("User not found", 404));
        return;
       }
      if (!user.verifyToken) {
        reject(new AppError("Token not found", 404)) 
        return;
      }

      const currentUser = await UserModel.findByIdAndUpdate(user._id, {
        verify: true,
        verifyToken: null,
      });
      resolve(currentUser);
    } catch (error) {
      reject(error);
    }
  });
};

let checkUserEmail = (userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await UserModel.findOne({
        where: { email: userEmail },
      });
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      reject(e);
    }
  });
};
