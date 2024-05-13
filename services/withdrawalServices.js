const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const WithdrawalRequest = require("../models/withDrawalRequest");
const Transaction = require("../models/transactionModel");
const User = require("../models/userModel");

exports.createWithdrawalRequest = ({ user_id, amount, bank_account }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(user_id);
      if (!user) {
        reject(new AppError(`User not found`, 400));
      }
    //   if (user.balance < amount || amount <= 0) {
    //     reject(new AppError(`Insufficent amount`, 400));
        //   }
        if (amount <= 0) {
            reject(new AppError(`Amount must be greater than 0`, 400));
        }
        if (user.balance < amount) {
            reject(new AppError(`Your balance is not enough to withdraw`, 400));
        }
      const transaction = await Transaction.create({
        user: user_id,
        amount,
        transaction_type: "withdrawal",
      });

      const request = await WithdrawalRequest.create({
        user: user_id,
        transaction: transaction._id,
        bank_account,

      });

      resolve({
        status: "success",
        data: request,
      });
    } catch (err) {
      reject(err);
    }
  });
};


