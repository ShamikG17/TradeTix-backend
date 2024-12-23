import User from "../models/user.model";
import { IUser } from "../models/user.model";
import { HttpError } from "../utils/customExceptionHandler.util";

export const createUser = async (user: Partial<IUser>) => {
  const { username, password, role, accountNumber, IFSCCode } = user;
  if (!username || !password || !role) {
    throw HttpError.badRequest("User", "Please provide all required fields");
  }
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw HttpError.conflict("User", "User already exists");
  }
  const newUser = new User({ username, password, role, accountNumber, IFSCCode });
  await newUser.save();
  const token = await newUser.generateAuthToken(role);
  return { user: newUser, token };
}

export const loginUser = async (user: Partial<IUser>, role: 'USER'|'ADMIN' = 'USER') => {
  const { username, password } = user;
  if (!username || !password) {
    throw HttpError.badRequest("User", "Please provide all required fields");
  }
  try {
    const existingUser = await User.findByCredentials(username, password);
    if (!existingUser) {
      throw HttpError.badRequest("User", "Invalid credentials");
    }
    const token = await existingUser.generateAuthToken(role);
    return { user: existingUser, token };
  } catch (e: any) {
    throw HttpError.internalServerError("User", e.message);
  }
};

export const getUsers = async (limit: number, page: number) => {
  const users = await User.find().limit(limit).skip(limit * (page - 1));
  return users;
}

export const getUserById = async (id: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw HttpError.notFound("User", "User not found");
  }
  return user;
}

export const updateUser = async (id: string, user: Partial<IUser>) => {
  const updatedUser = await User.findOneAndUpdate( { _id: id }, user, { new: true });
  if (!updatedUser) {
    throw HttpError.notFound("User", "User not found");
  }
  return updatedUser;
}

export const deleteUser = async (id: string) => {
  const deletedUser = await User.findOneAndDelete({ _id: id });
  if (!deletedUser) {
    throw HttpError.notFound("User", "User not found");
  }
  return deletedUser;
}
