import {
    PaymentGateway,
    PaymentGateways,
} from '../commons/contracts/types/payment-gateway';
import { envs } from '../commons/envs.common';
import { PaymentError } from '../commons/errors.common';
import { generateClientRefId } from '../commons/generate-id.common';
import { ChargeAccountDto } from '../dto/charge-account.dto';
import {
    TransactionModel,
    TransactionStatus,
} from '../schemas/transaction.schema';
import { UserModel } from '../schemas/user.schema';
import { ChargeAccountService } from './charge-account.service';
import { PaypingService } from './payping.service';

export class TransactionService {
    #chargeAccountService: ChargeAccountService;
    constructor() {
        this.#chargeAccountService = new ChargeAccountService();
    }

    async chargeAccount(chargeAccount: ChargeAccountDto, userId: string) {
        /**
         * business logics comes here
         */

        const user = await UserModel.findById(userId);

        if (!user) {
            throw new Error('user not found');
        }

        const description = 'charge account';
        const authority = generateClientRefId();
        // TODO: wrap it with mongoose transaction
        await TransactionModel.create({
            amount: chargeAccount.amount,
            realAmount: chargeAccount.amount,
            userId,
            authority,
        });
        let paymentGateway: PaymentGateway;

        switch (chargeAccount.paymentGateway) {
            case PaymentGateways.payping:
            default:
                paymentGateway = new PaypingService({
                    createPaymentGateway: {
                        amount: chargeAccount.amount,
                        authority,
                        description,
                        payerName: user.username,
                        phoneNumber: user.phoneNumber,
                        returnUrl: `${envs.restApi.baseUrl}${envs.payping.verifyCallbackEndpoint}`,
                    },
                });
                break;
        }

        return await this.#chargeAccountService.chargeAccount(paymentGateway);
    }

    async verifyChargeAccount(authority: string) {
        const transaction = await TransactionModel.findOne({
            authority,
            // authority: clientRefId,
        });

        if (!transaction) {
            throw new PaymentError(
                'Transaction not found',
                'callback?status=FAILED&message=TRANSACTION_NOT_FOUND',
            );
        }

        const user = await UserModel.findById(transaction.userId.toString());

        if (!user) {
            throw new PaymentError(
                'Transaction not found',
                'callback?status=FAILED&message=CONTRACTOR_NOT_FOUND',
            );
        }

        if (transaction.status !== TransactionStatus.PENDING) {
            throw new PaymentError(
                'Transaction status is not pending',
                'callback?status=FAILED&message=TRANSACTION_NOT_IN_PENDING',
            );
        }

        const result = await verifyPayment(
            this.completedTransaction!.refid,
            this.transaction.amount!,
        );

        if (result !== true) {
            throw new PaymentError(
                'Payment does not verified',
                'callback?status=failed',
            );
        }

        await TransactionModel.findByIdAndUpdate(transaction._id.toString(), {
            status: TransactionStatus.SUCCESSFUL,
            refId: this.completedTransaction!.refid,
            creditBeforeTransaction: user.credit,
        });

        if (transaction.amount === undefined) {
            console.warn(`transaction.amount is null/undefined`);
        }
        const finalAmount = user.credit + transaction.amount;

        await this.contractorService.update(contractor._id.toString(), {
            credit: contractor.credit + this.transaction.amount!,
            ...(finalAmount > 0
                ? {
                      usableCredit: contractor.usableCredit + 5 * finalAmount,
                  }
                : {}),
        });

        return result;
    }
}
