import { Document, Schema, Model, model, HydratedDocument } from "mongoose";
import { IUser } from "./user.model";
import { ITicket } from "./ticket.model";

export interface IListing extends Document {
  ticketID: ITicket;
  price: number;
  status: "OPEN" | "CLOSED";
  createdBy: IUser;
  createdAt: Date;
  updatedBy: IUser;
  updatedAt: Date;
}

export interface IListingMethods {
  // toJSON(user: "owner" | "buyer" | "user"): IListing;
}

interface ListingModel extends Model<IListing, {}, IListingMethods> {}

const listingSchema = new Schema<IListing, ListingModel, IListingMethods>(
  {
    ticketID: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN",
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

listingSchema.pre<IListing>("save", function (next) {
  this.createdAt = new Date();
  this.updatedAt = new Date();
  next();
});

listingSchema.pre<IListing>("findOneAndUpdate", function (next) {
  this.updatedAt = new Date();
  next();
});

const Listing = model<IListing, ListingModel>("Listing", listingSchema);

export default Listing;
