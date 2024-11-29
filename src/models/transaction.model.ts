import { Document, Schema, Model, model, HydratedDocument } from "mongoose";
import { IUser } from "./user.model";
import { ITicket } from "./ticket.model";

export interface ITransaction extends Document {
  ticketID: ITicket;
  sellerID: IUser;
  salePrice: number;
  createdBy: IUser;
  createdAt: Date;
  updatedBy: IUser;
  updatedAt: Date;
}

export interface ITransactionMethods {
  // toJSON(user: "owner" | "buyer" | "user"): ITransaction;
}

interface TransactionModel extends Model<ITransaction, {}, ITransactionMethods> {}

const transactionSchema = new Schema<ITransaction, TransactionModel, ITransactionMethods>(
  {
    ticketID: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    sellerID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    salePrice: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.pre<ITransaction>("save", function (next) {
  this.createdAt = new Date();
  this.updatedAt = new Date();
  next();
});

transactionSchema.pre<ITransaction>("findOneAndUpdate", function (next) {
  this.updatedAt = new Date();
  next();
});

const Transaction = model<ITransaction, TransactionModel>("Transaction", transactionSchema);

export default Transaction;
