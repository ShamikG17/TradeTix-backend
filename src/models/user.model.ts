import { Document, Model, model, HydratedDocument, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser extends Document{
    username: string;
    password: string;
    role: 'USER' | 'ADMIN';
    tokens: { token: string}[];
    accountNumber: string
    IFSCCode: string
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserMethods {
    generateAuthToken(role: 'user'|'admin'): Promise<string>;
    toJSON(): IUser;
}

interface UserModel extends Model<IUser, {}, IUserMethods> {
    findByCredentials(username: string, password: string): Promise<HydratedDocument<IUser, IUserMethods>>
}

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
    username: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        required: true,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    accountNumber: {
        type: String,
        trim: true
    },
    IFSCCode: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
});

userSchema.methods.generateAuthToken = async function(role: 'user' | 'admin' = 'user') {
    const user = this;
    const token = jwt.sign({ _id: (user._id as string).toString(), role}, process.env.JWT_SECRET!);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

userSchema.methods.toJSON = function() {
    const user = this as IUser;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    return userObject;
}

userSchema.statics.findByCredentials = async function(username: string, password: string) {
    const user = await User.findOne({ username });
    if(!user) {
        throw new Error('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
        throw new Error('Invalid credentials');
    }
    return user;
}

const User = model<IUser, UserModel>('User', userSchema);

export default User;