import { ObjectId } from 'mongodb';

import { UserModel } from '../schemas/user.schema';
import {
    TransactionStatus,
    TransactionModel,
} from '../schemas/transaction.schema';
import { generateClientRefId } from '../commons/generate-id.common';
import {
    PaymentGateway,
    PaymentGateways,
} from '../commons/contracts/types/payment-gateway';
import { PaypingService } from './payping.service';
import { ChargeAccountDto } from '../dto/charge-account.dto';
import { envs } from '../commons/envs.common';
import { PaypingVerifyDto } from '../dto/payping-verify.input-dto';

export class ChargeAccountService {
    constructor() {}

    async chargeAccount(
        paymentGateway: PaymentGateway,
    ): Promise<string> | never {
        return await paymentGateway.createPaymentGateway();
    }

    async verifyChargeAccount(
        paymentGateway: PaymentGateway,
        param: {
            paypingVerifyResponse: PaypingVerifyDto;
        },
    ): Promise<boolean> | never {}
}
