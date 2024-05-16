const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const BankAccount = require("../models/bankAccountModel");
const User = require("../models/userModel");

exports.createOrUpdateBankAccount = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if all required fields are provided
      if (!data.user || !data.number || !data.owner_name || !data.bank_name) {
        reject(new AppError(`Please fill all required fields`, 400));
        return; // Return to avoid further execution
      }

      // Check if a bank account already exists for the user
      const existingBankAccount = await BankAccount.findOne({
        user: data.user,
      });

      if (existingBankAccount) {
        // If a bank account exists, update it
        const updatedBankAccount = await BankAccount.findOneAndUpdate(
          { user: data.user },
          data,
          { new: true }
        );

        resolve({
          status: "success",
          message: "Bank account updated successfully",
          data: updatedBankAccount,
        });
      } else {
        // If no bank account exists, create a new one
        const newBankAccount = await BankAccount.create(data);

        resolve({
          status: "success",
          message: "Bank account created successfully",
          data: newBankAccount,
        });
      }
    } catch (err) {
      reject(err);
    }
  });
};

exports.getBankAccountByUserId = (user_id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!user_id) {
        reject(new AppError(`Empty Id`, 400));
        return;
      }

      const bankAccount = await BankAccount.findOne({ user: user_id });
      if (!bankAccount) {
        reject(new AppError(`Bank Account not found`, 404));
        return;
      }
      resolve({
        status: "success",
        data: bankAccount,
      });
    } catch (err) {
      reject(err);
    }
  });
};
