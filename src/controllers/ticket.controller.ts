import { FilterQuery } from "mongoose";
import { IEvent } from "../models/event.model";
import Ticket, { ITicket } from "../models/ticket.model";
import User, { IUser } from "../models/user.model";
import { HttpError } from "../utils/customExceptionHandler.util";

export const createTicket = async (
  ticket: Partial<ITicket>,
  eventID: Partial<IEvent>,
  user: Partial<IUser>
) => {
  const { seatNumber } = ticket;
  if (!seatNumber) {
    throw new Error("Please provide all required fields");
  }
  const newTicket = new Ticket({
    eventID,
    ownerID: user,
    seatNumber,
    createdBy: user,
    updatedBy: user,
  });
  await newTicket.save();
  return newTicket;
};

export const getTicketsForEvent = async (
  eventID: Partial<IEvent>,
  limit: number,
  page: number,
  filter: FilterQuery<IEvent>,
  sort: string,
  populateFields: string[] = []
) => {
  let query = Ticket.find({ ...filter, eventID })
    .limit(limit)
    .skip(limit * (page - 1))
    .sort(sort);

  populateFields.forEach((field) => {
    query = query.populate(field);
  });
  const tickets = await query.exec();
  return tickets;
};

export const updateTicket = async (
  id: string,
  ticket: Partial<ITicket>,
  user: Partial<IUser>
) => {
  const updatedTicket = await Ticket.findOneAndUpdate(
    { _id: id, ownerID: user.id },
    ticket,
    { new: true }
  );
  if (!updatedTicket) {
    throw HttpError.notFound("Ticket", "Ticket not found");
  }
  return updatedTicket;
};

export const deleteTicket = async (id: string) => {
  const deletedTicket = await Ticket.findOneAndDelete({ _id: id });
  if (!deletedTicket) {
    throw HttpError.notFound("Ticket", "Ticket not found");
  }
  return deletedTicket;
};
