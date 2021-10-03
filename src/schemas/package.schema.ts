import { Document, model, Schema } from 'mongoose';

export const COLLECTION_NAME = 'package';
export interface PackageDocument extends Document {
    name: string;
    price: number;
}

const packageSchema = new Schema<PackageDocument>(
    {
        name: String,
        price: Number,
    },
    {
        timestamps: true,
    },
);

export const PackageModel = model<PackageDocument>(
    COLLECTION_NAME,
    packageSchema,
);
