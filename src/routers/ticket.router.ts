import express from "express";
import { Request, Response } from "express";
import { updateTicket, deleteTicket } from "../controllers/ticket.controller";
import {
  createListing,
  getListingForTicket,
} from "../controllers/listing.controller";
import auth, { CustomRequest } from "../middlewares/auth.middleware";
import {
  createErrorResponse,
  createResponse,
} from "../utils/responseHandler.util";
import { IUser } from "../models/user.model";
import { ITicket } from "../models/ticket.model";
import { IListing } from "../models/listing.model";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Operations Related To Tickets.
 */

/**
 * @swagger
 * /api/v1/tickets:
 *   put:
 *     summary: Update a ticket
 *     description: Update a ticket
 *     tags: [Tickets]
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
 *     reponses:
 *       200:
 *         description: Ticket updated successfully
 *       400:
 *         description: Invalid request
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
      .send(createResponse("TICKET_CREATED", updatedTicket));
  } catch (error: any) {
    return res
      .status(error.status)
      .send(createErrorResponse(error.message, error.error));
  }
});

/**
 * @swagger
 * /api/v1/tickets/{id}:
 *   delete:
 *     summary: Delete ticket by ID
 *     description: Delete ticket by ID
 *     tags: [Tickets]
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
 *         description: Ticket deleted successfully
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
 * /api/v1/tickets/{id}/listings:
 *   post:
 *     summary: Create listing of the ticket by ID
 *     description: Create listing of the ticket by ID
 *     tags: [Tickets]
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
 *               price:
 *                 type: number
 *                 description: Price of the ticket to be sold
 *                 example: 300
 *               status:
 *                 type: string
 *                 description: Availability status of code
 *                 example: open
 *     responses:
 *       200:
 *         description: Ticket Listed Successfully
 *       400:
 *         description: Invalid Request
 *       401:
 *         description: User Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.post(
  "/:id/listings",
  auth(),
  async (req: CustomRequest, res: Response) => {
    try {
      const id: string = req.params.id;
      const listing: Partial<IListing> = {
        price: req.body.price,
        status: req.body.status || "open",
      };
      const user: Partial<IUser> = req.user!;
      const newListing = await createListing(listing, id, user);
      return res
        .status(201)
        .send(createResponse("LISTING_CREATED", newListing));
    } catch (error: any) {
      return res
      .status(409)
      .send(createErrorResponse("CONFLICT!. LISTINGS ALREADY EXISTS", error.errmsg));
    }
  }
);

/**
 * @swagger
 * /api/v1/tickets/{id}/listings:
 *   get:
 *     summary: Fetch the listings of the ticket
 *     description: Fetch the listings of the ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *       - in: query
 *         name: populate
 *         schema:
 *           type: string
 *           description: Fields to populate
 *           example: createdBy,updatedBy
 *         description: Fields to populate
 *     responses:
 *       200:
 *         description: Ticket fetched Successfully
 *       400:
 *         description: Invalid Request
 *       401:
 *         description: User Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get(
  "/:id/listings",
  auth(),
  async (req: CustomRequest, res: Response) => {
    try {
      const id: string = req.params.id;
      const populateFields = req.query.populate
        ? (req.query.populate as string).split(",")
        : [];
      const listings = await getListingForTicket(id, populateFields);
      return res.status(200).send(createResponse("LISTINGS_FETCHED", listings));
    } catch (error: any) {
      return res
        .status(error.status)
        .send(createErrorResponse(error.message, error.error));
    }
  }
);

export default router;
