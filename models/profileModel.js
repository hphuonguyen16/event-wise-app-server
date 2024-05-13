const mongoose = require("mongoose");

const Profileschema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      maxLength: 20,
      minLength: 2,
      trim: true,
      validate: {
        validator: function (value) {
          return /^[a-zA-Z0-9]+$/.test(value);
        },
        message: "Firstname only contains characters and numbers",
      },
    },
    name: {
      type: String,
      maxLength: 40,
      minLength: 2,
      trim: true,
      validate: {
        validator: function (value) {
          return /^[a-zA-Z0-9]+$/.test(value);
        },
        message: "Name only contains characters and numbers",
      },
    },
    lastname: {
      type: String,
      maxLength: 20,
      minLength: 2,
      trim: true,
      validate: {
        validator: function (value) {
          return /^[a-zA-Z0-9]+$/.test(value);
        },
        message: "Lastname only contains characters, numbers and underscore",
      },
    },
    name: {
      type: String,
      maxLength: 40,
      minLength: 2,
      trim: true,
      validate: {
        validator: function (value) {
          return /^[a-zA-Z0-9]+$/.test(value);
        },
        message: "Name only contains characters, numbers and underscore",
      },
    },
    gender: {
      type: Boolean,
    },
    avatar: String,
    address: String,
    bio: String,
    birthday: Date,
    social: {
      facebook: String,
      twitter: String,
    },
    website: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

Profileschema.index({ user: 1 }, { unique: true });
Profileschema.post("save", async function () {
  await this.populate("user");
});

const ProfileModel = mongoose.model("Profile", Profileschema);

module.exports = ProfileModel;
