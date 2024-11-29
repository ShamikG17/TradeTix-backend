import express from "express";
import { Request, Response } from "express";
import { buyTicketListing } from "../controllers/listing.controller";
import { updateTicket, deleteTicket } from "../controllers/ticket.controller";
import auth, { CustomRequest } from "../middlewares/auth.middleware";
import {
  createErrorResponse,
  createResponse,
} from "../utils/responseHandler.util";
import { IUser } from "../models/user.model";

import { ITicket } from "../models/ticket.model";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Listings
 *   description: Operations Related To Listings of the Tickets.
 */

/**
 * @swagger
 * /api/v1/listings/{id}:
 *   put:
 *     summary: Update the details of listed ticket by ID
 *     description: Update the details of listed ticket by ID
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               seatNumber:
 *                 type: string
 *                 description: Seat number of the ticket
 *                 example: "A2"
 *     responses:
 *       200:
 *         description: Ticket Updated Successfully
 *       400:
 *         description: Invalid Request
 *       401:
 *         description: User Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.put("/:id", auth(), async (req: CustomRequest, res: Response) => {
  try {
    const id: string = req.params.id;
    const ticket: Partial<ITicket> = {
      seatNumber: req.body.seatNumber,
    };
    const user: Partial<IUser> = req.user!;
    const updatedTicket = await updateTicket(id, ticket, user);
    return res
      .status(200)
      .send(createResponse("TICKET_UPDATED", updatedTicket));
  } catch (error: any) {
    return res
      .status(error.status)
      .send(createErrorResponse(error.message, error.error));
  }
});

/**
 * @swagger
 * /api/v1/listings/{id}:
 *   delete:
 *     summary: Delete the listed ticket by ID
 *     description: Delete the listed ticket by ID
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket removed Successfully
 *       400:
 *         description: Invalid Request
 *       401:
 *         description: User Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.delete("/:id", auth(), async (req: CustomRequest, res: Response) => {
  try {
    const id: string = req.params.id;
    const deletedTicket = await deleteTicket(id);
    return res
      .status(200)
      .send(createResponse("TICKET_DELETED", deletedTicket));
  } catch (error: any) {
    return res
      .status(error.status)
      .send(createErrorResponse(error.message, error.error));
  }
});

/**
 * @swagger
 * /api/v1/listings/{id}/buy:
 *   post:
 *     summary: Buy the listed ticket by ID
 *     description: Buy the listed ticket by ID
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID
 *     responses:
 *       200:
 *         description: Ticket bought Successfully
 *       400:
 *         description: Invalid Request
 *       401:
 *         description: User Unauthorized
 *       500:
 *         description: Internal Server Error
 */

router.post("/:id/buy", auth(), async (req: CustomRequest, res: Response) => {
  try {
    const id: string = req.params.id;
    const user: Partial<IUser> = req.user!;
    const transaction = await buyTicketListing(id, user);
    return res.status(200).send(createResponse("TICKET_BOUGHT", transaction));
  } catch (error: any) {
    return res
      .status(error.status)
      .send(createErrorResponse(error.message, error.error));
  }
});

export default router;
