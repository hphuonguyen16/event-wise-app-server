const Transaction = require("../models/transactionModel");
const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const mongoose = require("mongoose");
const User = require("../models/userModel");

exports.createTransactionDeposit = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.amount) {
        reject(new AppError(`Please fill all required fields`, 400));
        return;
      }

      data.transaction_type = "deposit";

      const transaction = await Transaction.create(data);

      resolve({
        status: "success",
        data: transaction,
      });
    } catch (err) {
      reject(err);
    }
  });
};

exports.handleSuccessDeposit = (transaction) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(transaction.user);
      if (!user) {
        reject(new AppError(`User not found`, 400));
        return;
      }
      await user.updateOne({
        balance: user.balance + transaction.amount,
      });
      resolve({
        status: "success",
      });
    } catch (err) {
      reject(err);
    }
  });
};

exports.getTransactionById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        reject(new AppError(`Empty Id`, 400));
        return;
      }

      const transaction = await Transaction.findById(id);
      if (!transaction) {
        reject(new AppError(`Transaction not found`, 404));
        return;
      }
      resolve({
        status: "success",
        data: transaction,
      });
    } catch (err) {
      reject(err);
    }
  });
};
exports.changeTransactionStatus = (id, status) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        reject(new AppError(`Empty Id`, 400));
        return;
      }

      const transaction = await Transaction.findByIdAndUpdate(
        id,
        {
          status: status,
        },
        { new: true }
      );
      if (!transaction) {
        reject(new AppError(`Transaction not found`, 404));
        return;
      }

      resolve({
        status: "success",
        data: transaction,
      });
    } catch (err) {
      reject(err);
    }
  });
};

exports.getAllTransactions = (query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const features = new APIFeatures(
        Transaction.find()
          .populate({
            path: "user",
            select: "profile email", // Specify the fields you want to retrieve
          })
          .populate({
            path: "organizer",
            select: "profile email", // Specify the fields you want to retrieve
          }),
        query
      )
        .sort()
        .paginate();

      const transactions = await features.query;

      resolve({
        status: "success",
        results: transactions.length,
        data: transactions,
      });
    } catch (err) {
      reject(err);
    }
  });
};

exports.getTransactionByBusiness = (id, query) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        reject(new AppError(`Empty business account id`, 400));
      }
      const features = new APIFeatures(
        PostTransaction.find({}).populate({
          path: "post",
          populate: {
            path: "user",
            model: "User",
            match: { id: id },
          },
        }),
        query
      )
        .sort()
        .paginate();

      let transactions = await features.query;
      transactions = transactions.filter(
        (transaction) => transaction.post && transaction.post.user.id === id
      );
      resolve({
        status: "success",
        results: transactions.length,
        data: transactions,
      });
    } catch (err) {
      reject(err);
    }
  });
};

