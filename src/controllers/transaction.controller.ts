import { FilterQuery, ObjectId } from "mongoose";
import Transaction, { ITransaction } from "../models/transaction.model";
import { IUser } from "../models/user.model";
import { HttpError } from "../utils/customExceptionHandler.util";
import Listing, { IListing } from "../models/listing.model";

export const createTransaction = async (
  listing: Partial<IListing>,
  user: Partial<IUser>
) => {
  const newTransaction = new Transaction({
    ticketID: listing.ticketID,
    sellerID: listing.ticketID!.ownerID,
    salePrice: listing.price,
    createdBy: user,
    updatedBy: user,
  });
  await newTransaction.save();
  return newTransaction;
};

export const getTransactions = async (
  limit: number,
  page: number,
  filter: FilterQuery<ITransaction>,
  sort: string,
  populateFields: string[] = []
) => {
  let query = Transaction.find(filter)
    .limit(limit)
    .skip(limit * (page - 1))
    .sort(sort);
  populateFields.forEach((field) => {
    query = query.populate(field);
  });
  const transactions = await query.exec();
  return transactions;
};

export const getTransactionById = async (
  id: string,
  populateFields: string[] = []
) => {
  let query = Transaction.findById(id);
  populateFields.forEach((field) => {
    query = query.populate(field);
  });
  const transaction = await query.exec();
  if (!transaction) {
    throw HttpError.notFound("Transaction", "Transaction not found");
  }
  return transaction;
};
