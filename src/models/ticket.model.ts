import { Document, Schema, Model, model, HydratedDocument } from "mongoose";
import { IUser } from "./user.model";
import { IEvent } from "./event.model";

export interface ITicket extends Document {
  eventID: IEvent;
  ownerID: IUser;
  seatNumber: string;
  createdBy: IUser;
  createdAt: Date;
  updatedBy: IUser;
  updatedAt: Date;
}

export interface ITicketMethods {
  // toJSON(user: "owner" | "buyer" | "user"): ITicket;
}

interface TicketModel extends Model<ITicket, {}, ITicketMethods> {}

const ticketSchema = new Schema<ITicket, ITicketMethods>(
  {
    eventID: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    ownerID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seatNumber: {
      type: String,
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

ticketSchema.pre<ITicket>("save", function (next) {
  this.createdAt = new Date();
  this.updatedAt = new Date();
  next();
});

ticketSchema.pre<ITicket>("findOneAndUpdate", function (next) {
  this.updatedAt = new Date();
  next();
});

// ticketSchema.methods.toJSON = function (user: "owner" | "buyer" | "user") {
//   const ticket = this as ITicket;
//   const ticketObject = ticket.toObject();

//   if (user === "owner") {
//     delete ticketObject.owner.tokens;
//     delete ticketObject.owner.password;
//     delete ticketObject.buyer;
//   } else if (user === "buyer") {
//     delete ticketObject.buyer.tokens;
//     delete ticketObject.buyer.password;
//     delete ticketObject.owner;
//   } else {
//     delete ticketObject.owner;
//     delete ticketObject.buyer;
//   }

//   return ticketObject;
// };

const Ticket = model<ITicket, TicketModel>("Ticket", ticketSchema);

export default Ticket;
