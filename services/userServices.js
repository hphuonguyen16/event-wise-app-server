const ProfileModel = require("./../models/profileModel");
const UserModel = require("./../models/userModel");

const AppError = require("./../utils/appError");
exports.getProfileByID = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        reject(new AppError(`Missing parameter`, 400));
        return;
      } else {
        let user = await UserModel.findById(id)
          .select("-password")
          .populate("profile");
        resolve({
          status: "Success",
          data: user,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
exports.checkMyId = (myId, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        reject(new AppError(`Missing parameter`, 400));
        return;
      } else {
        let check;
        if (myId === id) {
          check = true;
        } else {
          check = false;
        }
        resolve({
          data: check,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
exports.updateMe = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        reject(new AppError(`Missing parameter`, 400));
        return;
      } else {
        await ProfileModel.findOneAndUpdate(
          { user: id },
          {
            firstname: data.firstname,
            lastname: data.lastname,
            name: data.name,
            gender: data.gender,
            avatar: data.avatar,
            address: data.address,
            bio: data.bio,
            birthday: data.birthday,
            social: {
              facebook: data.social?.facebook,
              twitter: data.social?.twitter,
            },
            website: data.website,
          }
        );
        resolve({
          status: "Success",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

exports.lockOrUnlockAccount = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        reject(new AppError(`Missing parameter`, 400));
        return;
      } else {
        let account = await UserModel.findById(id);
        if (account) {
          const updatedIsActived =
            account.isActived !== undefined ? !account.isActived : false;
          await UserModel.findByIdAndUpdate(id, {
            isActived: updatedIsActived,
          });
        }

        resolve({
          status: "Success",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
