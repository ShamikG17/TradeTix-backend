import express from "express";
import { IUser } from "../models/user.model";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser
} from "../controllers/user.controller";
import auth, { CustomRequest } from "../middlewares/auth.middleware";
import { Request, Response } from "express";
import {
  createErrorResponse,
  createResponse,
} from "../utils/responseHandler.util";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Operations Related To Users.
 */

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a user
 *     description: Create a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid Request
 *       500:
 *         description: Internal Server Error
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const createdUser = await createUser(req.body);
    return res.status(201).send(createResponse("USER_CREATED", createdUser));
  } catch (error: any) {
    return res
      .status(500)
      .send(createErrorResponse(error.message, error.error));
  }
});

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users
 *     description: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All users details fetched sucessfully
 *       400:
 *         description: Invalid Request
 *       401:
 *         description: User Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get("/", auth(), async (req: CustomRequest, res: Response) => {
  try {
    const users = await getUsers(
      Number(req.query.limit),
      Number(req.query.page)
    );
    return res.status(200).send(createResponse("USERS_FETCHED", users));
  } catch (error: any) {
    return res
      .status(error.status)
      .send(createErrorResponse(error.message, error.error));
  }
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Get user by ID
 *       400:
 *         description: Invalid Request
 *       401:
 *         description: User Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id", auth(), async (req: CustomRequest, res: Response) => {
  try {
    const user = await getUserById(req.params.id);
    return res.status(200).send(createResponse("USER_FETCHED", user));
  } catch (error: any) {
    return res
      .status(error.status)
      .send(createErrorResponse(error.message, error.error));
  }
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update user by ID
 *     description: Update user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid Request
 *       401:
 *         description: User Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.put("/:id", auth(), async (req: CustomRequest, res: Response) => {
  try {
    const user = await updateUser(req.params.id, req.body);
    return res.status(200).send(createResponse("USER_UPDATED", user));
  } catch (error: any) {
    return res
      .status(error.status)
      .send(createErrorResponse(error.message, error.error));
  }
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     description: Delete user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Invalid Request
 *       401:
 *         description: User Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.delete("/:id", auth(), async (req: CustomRequest, res: Response) => {
  try {
    const user = await deleteUser(req.params.id);
    return res.status(200).send(createResponse("USER_DELETED", user));
  } catch (error: any) {
    return res
      .status(error.status)
      .send(createErrorResponse(error.message, error.error));
  }
});

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: Login a user
 *     description: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid Request
 *       500:
 *         description: Internal Server Error
 */
router.post('/login', async (req: Request, res: Response) => {
    try {
        const user: Partial<IUser> = {
            username: req.body.username,
            password: req.body.password
        }
        const loggedInUser = await loginUser(user);
        return res.send(createResponse("USER_LOGGED_IN", loggedInUser));
    } catch(error: any) {
        return res.status(error.status).send(createErrorResponse(error.message, error.error));
    }
})

/**
 * @swagger
 * /api/v1/users/logout:
 *   post:
 *     summary: Logout a user
 *     description: Logout a user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       500:
 *         description: Internal Server Error
 */
router.post('/logout', auth(), async (req: CustomRequest, res: Response) => {
    try {
        if(req.user) {
            req.user.tokens = req.user.tokens.filter((token) => {
                return token.token !== req.token;
            })
            await req.user.save();
        }
        return res.status(200).json(createResponse("USER_LOGGED_OUT", "Logged out"));
    } catch(error: any) {
        return res.status(error.status).send(createErrorResponse(error.message, error.error));
    }
});

export default router;
