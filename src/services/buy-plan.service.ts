import { BadRequestError, NotFoundError } from 'routing-controllers';
import { ObjectId } from 'mongodb';

import { TransactionService, PaymentError } from './transaction.service';
import { PackageModel, PackageDocument } from '../schemas/package.schema';
import { UserDocument, UserModel } from '../schemas/user.schema';

export class BuyPlanService extends TransactionService {
    #package: PackageDocument | null;
    #user: UserDocument | null;
    #clientRefId: string | null;

    constructor() {
        super();
    }

    async requestPayment(
        amount: number,
        phoneNumber: string,
        payerName: string,
        description: string,
        returnUrl: string,
        clientRefId: string,
    ): Promise<string> {
        if (!this.contractor || this.contractor.user === undefined) {
            logger.info('Contractor/User', { meta: this.contractor });
            throw new Error(
                'Contractor/User not found with the given jwt token',
            );
        }
        if (this.contractor.isVerified === false) {
            throw new BadRequestError('NOT_VERIFIED_CONTRACTOR');
        }
        if (!this.memberShipPlan) {
            throw new NotFoundError('memberShipPlan_not_found');
        }

        this.transaction = await super.create({
            amount,
            asTo: this.memberShipPlan!._id.toString(),
            refModel: RefModel['membership-plan'],
            realAmount: this.memberShipPlan!.price,
            owner:
                typeof this.contractor?.user === 'object'
                    ? this.contractor?.user._id.toString()
                    : this.contractor?.user?.toString(),
            authority: clientRefId,
            label: [TransactionLabels.BUY_MEMBER_SHIP_PLAN],
        });

        const paymentGatewayUrl = await super.requestPayment(
            amount,
            phoneNumber,
            payerName,
            description,
            returnUrl,
            clientRefId,
        );

        return paymentGatewayUrl;
    }

    async verifyPayment(refId: string): Promise<boolean> | never {
        this.transaction = await super.find({
            authority: this.clientRefId!,
        });

        if (!this.transaction) {
            throw new PaymentError(
                `transaction with this authority ${this.clientRefId} does not exits`,
                'callback?status=FAILED&message=TRANSACTION_NOT_FOUND',
            );
        }

        const contractors = await this.contractorService.aggregate([
            {
                $match: {
                    user: new ObjectId(this.transaction.owner.toString()),
                },
            },
            {
                $lookup: {
                    from: 'membership-plans',
                    localField: 'activePlan.plan',
                    foreignField: '_id',
                    as: 'plan',
                },
            },
            {
                $unwind: {
                    path: '$plan',
                    preserveNullAndEmptyArrays: true,
                },
            },
        ]);
        const contractor = contractors[0];

        if (!contractor) {
            throw new PaymentError(
                'Contractor not found',
                'callback?status=FAILED&message=CONTRACTOR_NOT_FOUND',
            );
        }
        if (this.transaction.status !== transactionStatus.PENDING) {
            throw new PaymentError(
                `transaction status is not pending, transaction id: ${this.transaction._id.toString()}`,
                'callback?status=FAILED&message=TRANSACTION_NOT_IN_PENDING',
            );
        }

        const memberShipPlan =
            await this.membershipPlanService.getMembershipPlanById(
                this.transaction.asTo!.toString(),
            );

        const response = await super.verifyPayment(
            refId,
            this.transaction.amount!,
        );

        if (response !== true) {
            throw new PaymentError(
                'Payment does not verified',
                'callback?status=failed',
            );
        }

        /**@type {import('../contracts/types/contractor.type').ActivePlan}*/
        const activePlan = {
            plan: this.transaction.asTo.toString(),
            isActivated: true,
            expireAt: new Date(
                new Date().getTime() +
                    1000 * 24 * 60 * 60 * memberShipPlan!.planLength,
            ),
            activatedAt: new Date(),
        };
        const activity = this.contractorService.contractorActivity(
            memberShipPlan!,
            contractor,
        );

        await super.update(this.transaction._id.toString(), {
            status: TransactionStatus.SUCCESSFUL,
            refId,
        });
        await this.contractorService.update(contractor._id.toString(), {
            activePlan,
            activity,
        });

        agenda.schedule(
            `${memberShipPlan!.planLength} days`,
            'SMS_AFTER_EXPIRE_MEMBER_SHIP_PLAN',
            { contractor: this.contractor },
        );

        return true;
    }
}
