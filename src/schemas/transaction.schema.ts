import { Document, Model, model, Schema } from 'mongoose';
import { ObjectId } from 'mongodb';

export enum TransactionStatus {
    PENDING = 'pending',
    SUCCESSFUL = 'successful',
    FAILED = 'failed',
    OUT_OF_CALCULATION = 'out_of_calculation',
}
export const COLLECTION_NAME = 'transaction';

import { UserDocument } from './user.schema';
import {
    AdminTransactionOutputDto,
    UserTransactionOutputDto,
} from '../dto/transaction-output.dto';

export interface TransactionDocument extends Document {
    _id: string | ObjectId;
    amount?: number;
    realAmount?: number;
    status: TransactionStatus;
    userId: string | UserDocument;
    refId: string;
    authority: string;
    // clientRefId: string;
    description: string;
    paymentGateWayFailedData?: {
        createPaymentGateway?: string[];
        verifyPayment?: string[];
    };
    createdAt?: Date | any;
    updatedAt?: Date | any;
}

interface TransactionStaticMethods extends Model<TransactionDocument> {
    toAdminDto(transaction: TransactionDocument): AdminTransactionOutputDto;
    toUserDto(transaction: TransactionDocument): UserTransactionOutputDto;
}

const transactionSchema = new Schema<
    TransactionDocument,
    TransactionStaticMethods
>(
    {
        amount: Number,
        realAmount: Number,
        status: {
            type: String,
            required: true,
            default: TransactionStatus.PENDING,
            enum: Object.values({ ...TransactionStatus }),
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        refId: String,
        authority: String,
        // clientRefId: String,
        description: String,
        paymentGateWayFailedData: {
            createPaymentGateway: [String],
            verifyPayment: [String],
        },
    },
    {
        timestamps: true,
    },
);
transactionSchema.static(
    'toUserDto',
    function (transaction: TransactionDocument): UserTransactionOutputDto {
        return new UserTransactionOutputDto(transaction);
    },
);
transactionSchema.static(
    'toAdminDto',
    function (transaction: TransactionDocument): AdminTransactionOutputDto {
        return new AdminTransactionOutputDto(transaction);
    },
);

export const TransactionModel = model<
    TransactionDocument,
    TransactionStaticMethods
>(COLLECTION_NAME, transactionSchema);
