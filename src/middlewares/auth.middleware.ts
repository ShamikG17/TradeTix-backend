import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user.model";
import { HttpError } from "../utils/customExceptionHandler.util";

export interface CustomRequest extends Request {
  user?: IUser;
  token?: string;
}

interface DecodedToken {
  _id: string;
}

const auth =
  (role: "USER" | "ADMIN" = "USER") =>
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        throw HttpError.unauthorized("User", "Please authenticate");
      }
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as DecodedToken;
      const user = await User.findOne({
        _id: decoded._id,
        "tokens.token": token,
      });

      if (!user) {
        throw HttpError.unauthorized("User", "Please authenticate");
      }

      if (role === "ADMIN" && user.role !== "ADMIN") {
        throw HttpError.forbidden("User", "Access denied");
      }

      req.user = user;
      req.token = token;
      next();
    } catch (e: any) {
      res.status(401).send({ error: e.message });
    }
  };

export default auth;
