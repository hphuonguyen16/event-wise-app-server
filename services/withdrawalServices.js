const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const WithdrawalRequest = require("../models/withDrawalRequest");
const Transaction = require("../models/transactionModel");
const User = require("../models/userModel");
const { startSession } = require("mongoose");

exports.createWithdrawalRequest = ({ user_id, amount, bank_account }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(user_id);
      if (!user) {
        reject(new AppError(`User not found`, 400));
        return;
      }
      //   if (user.balance < amount || amount <= 0) {
      //     reject(new AppError(`Insufficent amount`, 400));
      //   }
      if (amount <= 0) {
        reject(new AppError(`Amount must be greater than 0`, 400));
        return;
      }
      if (user.balance < amount) {
        reject(new AppError(`Your balance is not enough to withdraw`, 400));
        return;
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

exports.getAllWithdrawalRequests = (query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const features = new APIFeatures(
        WithdrawalRequest.find()
          .populate({
            path: "user",
            select: "profile email", // Specify the fields you want to retrieve
          })
          .populate("transaction"),
        query
      )
        .filter()
        .sort()
        .limitFields()
        .paginate();
      const requests = await features.query;
      resolve({
        status: "success",
        data: requests,
      });
    } catch (err) {
      reject(err);
    }
  });
};

const fetchWithdrawalRequestById = async (withdrawal_request_id) => {
  const withdrawal_request = await WithdrawalRequest.findById(
    withdrawal_request_id
  ).populate([
    {
      path: "user",
      select: "email profile balance",
    },
    {
      path: "transaction",
    },
  ]);

  return withdrawal_request;
};

exports.fulfillWithdrawalRequest = async (withdrawal_request_id) => {
  return new Promise(async (resolve, reject) => {
    const withdrawal_request = await WithdrawalRequest.findById(
      withdrawal_request_id
    );
    if (!withdrawal_request) {
      reject(new AppError(`Request not found`, 404));
      return;
    }

    const transaction = await Transaction.findById(
      withdrawal_request.transaction
    );
    if (!transaction) {
      reject(new AppError(`Transaction not found`, 404));
      return;
    }
    if (transaction.status !== "processing") {
      reject(new AppError(` "Can't execute this transaction"`, 400));
      return;
    }

    const session = await startSession();
    try {
      // start transaction
      session.startTransaction();
      const user = await User.findByIdAndUpdate(
        transaction.user,
        {
          $inc: { balance: -transaction.amount },
        },
        {
          session,
          new: true,
        }
      );

      if (!user) {
        reject(new AppError(`User not found`, 404));
        return;
      }
      if (user.balance < 0) {
        reject(new AppError(`Insufficent balance`, 400));
        return;
      }

      await session.commitTransaction();

      transaction.status = "success";
      await transaction.save();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    resolve({
      status: "success",
      data: await fetchWithdrawalRequestById(withdrawal_request_id),
    });
  });
};

exports.cancelWithdrawalRequest = async (withdrawal_request_id) => {
  return new Promise(async (resolve, reject) => {
    const withdrawal_request = await WithdrawalRequest.findById(
      withdrawal_request_id
    ).populate("transaction");
    if (!withdrawal_request) {
      reject(new AppError(`Request not found`, 404));
      return;
    }
    if (withdrawal_request.transaction.status !== "processing") {
      reject(new AppError(`Can't execute this transaction`, 400));
      return;
    }
    await Transaction.findByIdAndUpdate(withdrawal_request.transaction, {
      status: "canceled",
    });
    resolve({
      status: "success",
      data: await fetchWithdrawalRequestById(withdrawal_request_id),
    });
  });
};
