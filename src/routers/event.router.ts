import express from "express";
import { Request, Response } from "express";
import {
  createEvent,
  deleteEvent,
  getEvents,
  getEventById,
  updateEvent,
} from "../controllers/event.controller";
import { createTicket, getTicketsForEvent } from "../controllers/ticket.controller";
import auth, { CustomRequest } from "../middlewares/auth.middleware";
import {
  createErrorResponse,
  createResponse,
} from "../utils/responseHandler.util";
import { IEvent } from "../models/event.model";
import { ITicket } from "../models/ticket.model";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Operations Related To Events.
 */

/**
 * @swagger
 * /api/v1/events:
 *   post:
 *     summary: Create new Event
 *     description: Create new Event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: Name of the event
 *                example: "Dua Lipa India Tour"
 *              date:
 *                type: date
 *                description: Date of the event
 *                example: "2025-01-31T00:00:00.000Z"
 *              venue:
 *                type: string
 *                description: Venue of the event
 *                example: "Ahemdabad"
 *              performers:
 *                type: array
 *                description: Performers of the event
 *                example: ["Dua Lipa", "Sabrina Carpenter"]
 *              categories:
 *                type: array
 *                description: Categories of the event
 *                example: ["Music", "Concert"]
 *              isAvailable:
 *                type: boolean
 *                description: Availability of the event
 *                example: false
 *              validFrom:
 *                type: date
 *                description: Valid from date of the event
 *                example: "2025-01-01T00:00:00.000Z"
 *              validTo:
 *                type: date
 *                description: Valid to date of the event
 *                example: "2025-01-31T00:00:00.000Z"
 *     responses:
 *       200:
 *         description: Creates new ticket
 *       400:
 *         description: Error occurred due to Bad Request  
 *       500:
 *         description: Internal Server Error
 */
router.post("/", auth(), async (req: CustomRequest, res: Response) => {
  try {
    const event = await createEvent(req.body, req.user!);
    return res.status(201).send(createResponse("EVENT_CREATED", event));
  } catch (error: any) {
    return res
      .status(500)
      .send(createErrorResponse("INTERNAL_SERVER_ERROR", error.message));
  }
});

/**
 * @swagger
 * /api/v1/events/{id}/tickets:
 *   post:
 *     summary: Create new Ticket
 *     description: Create new Ticket for an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: Event ID
 *           example: 60f3b3b3b3b3b3b3b3b3b3b
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
 *                 example: "A1"
 *     responses:
 *       200:
 *         description: Creates new ticket
 *       400:
 *         description: Invalid Request
 *       401:
 *         description: User Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.post(
  "/:id/tickets",
  auth(),
  async (req: CustomRequest, res: Response) => {
    try {
      const ticket = await createTicket(
        req.body as Partial<ITicket>,
        req.params.id as Partial<IEvent>,
        req.user!
      );
      return res.status(201).send(createResponse("TICKET_CREATED", ticket));
    } catch (error: any) {
      return res
        .status(500)
        .send(createErrorResponse("INTERNAL_SERVER_ERROR", error.message));
    }
  }
);

/**
 * @swagger
 * /api/v1/events/{id}/tickets:
 *   get:
 *     summary: Get all tickets
 *     description: Get all tickets for an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: Event ID
 *           example: 60f3b3b3b3b3b3b3b3b3b3b
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           description: The number of tickets to return
 *           example: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           description: The page number
 *           example: 1
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           description: JSON string to filter tickets
 *           example: {"seatNumber": "A1"}
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           description: Field to sort tickets by
 *           example: "-createdAt"
 *       - in: query
 *         name: populate
 *         schema:
 *           type: string
 *           description: Fields to populate
 *           example: "ownerID"
 *     responses:
 *       200:
 *         description: Returns all tickets
 *       400:
 *         description: Invalid Request
 *       401:
 *         description: User Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id/tickets", auth(), async (req: CustomRequest, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const page = parseInt(req.query.page as string) || 1;
      const filter = req.query.filter
        ? JSON.parse(req.query.filter as string)
        : {};
      const sort = (req.query.sort as string) || "-createdAt";
      const populateFields = req.query.populate ? (req.query.populate as string).split(",") : [];

      const tickets = await getTicketsForEvent(
        req.params.id as Partial<IEvent>,
        limit,
        page,
        filter,
        sort,
        populateFields
      );
      return res.status(200).send(createResponse("TICKETS_FETCHED", tickets));
    } catch (error: any) {
      return res
        .status(error.status)
        .send(createErrorResponse(error.message, error.error));
    }
  });

/**
 * @swagger
 * /api/v1/events:
 *   get:
 *     summary: Get all Events
 *     description: Get all Events
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           example: 10
 *         description: Number of events to get
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           example: 1
 *         description: Page number
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           example: {"name": "Dua Lipa India Tour"}
 *         description: JSON string to filter events
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: "-createdAt"
 *         description: Field to sort events by
 *       - in: query
 *         name: populate
 *         schema:
 *           type: string
 *           description: Fields to populate
 *           example: "ownerID"
 *     responses:
 *       200:
 *         description: Get all events
 *       400:
 *         description: Invalid Request
 *       401:
 *         description: User Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get("/", auth(), async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const filter = req.query.filter
      ? JSON.parse(req.query.filter as string)
      : {};
    const sort = (req.query.sort as string) || "-createdAt";
    const populateFields = req.query.populate ? (req.query.populate as string).split(",") : [];
    
    const events = await getEvents(limit, page, filter, sort);
    return res.status(200).send(createResponse("EVENTS_FETCHED", events));
  } catch (error: any) {
    return res
      .status(500)
      .send(createErrorResponse("INTERNAL_SERVER_ERROR", error.message));
  }
});

/**
 * @swagger
 * /api/v1/events/{id}:
 *   get:
 *     summary: Get Event by ID
 *     description: Get Event by ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: Event ID
 *       - in: query
 *         name: populate
 *         schema:
 *           type: string
 *           description: Fields to populate 
 *           example: "ownerID"
 *         description: Fields to populate
 *     responses:
 *       200:
 *         description: Get event by ID
 *       400:
 *         description: Invalid Request
 *       401:
 *         description: User Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id", auth(), async (req: Request, res: Response) => {
  try {
    const populateFields = req.query.populate ? (req.query.populate as string).split(",") : [];
    const event = await getEventById(req.params.id, populateFields);
    return res.status(200).send(createResponse("EVENT_FETCHED", event));
  } catch (error: any) {
    return res
      .status(500)
      .send(createErrorResponse("INTERNAL_SERVER_ERROR", error.message));
  }
});

/**
 * @swagger
 * /api/v1/events/{id}:
 *   put:
 *     summary: Update Event by ID
 *     description: Update Event by ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: Name of the event
 *                example: "Arijit Singh Concert"
 *              date:
 *                type: date
 *                description: Date of the event
 *                example: "2022-12-31T00:00:00.000Z"
 *              venue:
 *                type: string
 *                description: Venue of the event
 *                example: "Mumbai"
 *              performers:
 *                type: array
 *                description: Performers of the event
 *                example: ["Arijit Singh", "Shreya Ghoshal"]
 *              categories:
 *                type: array
 *                description: Categories of the event
 *                example: ["Music", "Concert"]
 *     responses:
 *       200:
 *         description: Update event by ID
 *       400:
 *         description: Invalid Request
 *       401:
 *         description: User Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.put("/:id", auth(), async (req: CustomRequest, res: Response) => {
  try {
    const event = await updateEvent(req.params.id, req.body, req.user!);
    return res.status(200).send(createResponse("EVENT_UPDATED", event));
  } catch (error: any) {
    return res
      .status(500)
      .send(createErrorResponse("INTERNAL_SERVER_ERROR", error.message));
  }
});

/**
 * @swagger
 * /api/v1/events/{id}:
 *   delete:
 *     summary: Delete Event by ID
 *     description: Delete Event by ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Delete event by ID
 *       400:
 *         description: Invalid Request
 *       401:
 *         description: User Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.delete("/:id", auth(), async (req: CustomRequest, res: Response) => {
  try {
    const event = await deleteEvent(req.params.id);
    return res.status(200).send(createResponse("EVENT_DELETED", event));
  } catch (error: any) {
    return res
      .status(500)
      .send(createErrorResponse("INTERNAL_SERVER_ERROR", error.message));
  }
});

export default router;
