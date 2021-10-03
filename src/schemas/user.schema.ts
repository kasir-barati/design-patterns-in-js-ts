import { Schema, Document, model, Model, Types } from 'mongoose';

export const COLLECTION_NAME = 'user';
export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    UNKNOWN = 'UNKNOWN',
}
export interface UserDocument extends Document {
    _id: Types.ObjectId;
    username: string;
    phoneNumber: string;
    password: string;
    credit: number;
    gender: Gender;
    createdAt?: Date | any;
    updatedAt?: Date | any;
}

import { UserOutputDto } from '../dto/user-output.dto';

const userSchema = new Schema<UserDocument, UserStaticMethods>(
    {
        username: { type: String, unique: true, required: false },
        phoneNumber: String,
        password: String,
        credit: Number,
        gender: { type: String, enum: Object.values({ ...Gender }) },
    },
    {
        timestamps: true,
    },
);

interface UserStaticMethods extends Model<UserDocument> {
    toDto(user: UserDocument): UserOutputDto;
}

userSchema.static('toDto', function (user: UserDocument): UserOutputDto {
    return new UserOutputDto(user);
});

export const UserModel = model<UserDocument, UserStaticMethods>(
    COLLECTION_NAME,
    userSchema,
);
