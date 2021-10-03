import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongodb';

import {
    TransactionDocument,
    TransactionStatus,
} from '../schemas/transaction.schema';
import { UserModel } from '../schemas/user.schema';
import { UserOutputDto } from './user-output.dto';

export class RequestPackageOutputDto {
    @IsString()
    paymentUrl: string;
}

export class UserTransactionOutputDto {
    constructor(data: TransactionDocument) {
        this.amount = data.amount;
        this.status = data.status;
        if (data.owner === undefined) {
            console.log(`transaction.owner is empty: ${data._id.toString()}`);
        } else {
            this.owner =
                typeof data.owner === 'string' || data.owner instanceof ObjectId
                    ? data.owner.toString()
                    : UserModel.toDto(data.owner);
        }
        this.description = data.description;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    @IsOptional()
    @IsNumber()
    amount?: number;

    @IsString()
    @IsEnum(TransactionStatus)
    status: TransactionStatus;

    @IsString()
    owner?: string | ObjectId | UserOutputDto;

    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    createdAt?: Date;

    @IsOptional()
    @IsString()
    updatedAt?: Date;
}

export class AdminTransactionOutputDto {
    constructor(data: TransactionDocument) {
        this._id = data?._id?.toString();
        this.amount = data.amount;
        this.realAmount = data.realAmount;
        this.status = data.status;
        if (data.owner === undefined) {
            console.log(`transaction.owner is empty: ${data._id.toString()}`);
        } else {
            this.owner =
                typeof data.owner === 'string' || data.owner instanceof ObjectId
                    ? data.owner.toString()
                    : UserModel.toDto(data.owner);
        }
        this.refId = data.refId;
        this.authority = data.authority;
        this.description = data.description;
        this.usedCouponCode = data.usedCouponCode;
        this.creditBeforeTransaction = data.creditBeforeTransaction;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    @IsOptional()
    @IsString()
    _id?: string;

    @IsOptional()
    @IsNumber()
    amount?: number;

    @IsOptional()
    @IsNumber()
    realAmount?: number;

    @IsString()
    @IsEnum(TransactionStatus)
    status: TransactionStatus;

    @IsString()
    refId: string;

    @IsString()
    authority: string;

    @IsString()
    owner?: string | ObjectId | UserOutputDto;

    @IsString()
    description: string;

    @IsString()
    usedCouponCode: string;

    @IsNumber()
    creditBeforeTransaction: number;

    @IsNumber()
    count: number;

    @IsOptional()
    @IsString()
    createdAt?: Date;

    @IsOptional()
    @IsString()
    updatedAt?: Date;
}
