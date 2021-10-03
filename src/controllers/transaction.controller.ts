import {
    Body,
    CurrentUser,
    ForbiddenError,
    Get,
    JsonController,
    HttpCode,
    NotFoundError,
    Param,
    Post,
    QueryParams,
    Redirect,
    UseBefore,
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { BuyPlanService } from '../services/buy-plan.service';
import { envs } from '../commons/envs.common';
import { Response } from '../commons/contracts/models/response.model';
import { JwtPayload } from '../commons/contracts/types/jwt-payload.type';
import { ChargeAccountService } from '../services/charge-account.service';
import { PaypingVerifyDto } from '../dto/payping-verify.input-dto';
import { auth } from '../middlewares/auth.middleware';
import { ChargeAccountDto } from '../dto/charge-account.dto';
import { RequestPackageOutputDto } from '../dto/transaction-output.dto';
import { PaymentError } from '../commons/errors.common';
import { TransactionService } from '../services/transaction.service';

@JsonController()
export class TransactionController {
    #transactionService: TransactionService;
    constructor() {
        this.#transactionService = new TransactionService();
    }

    @Post('/transactions/charge-account')
    @UseBefore(auth.required)
    @OpenAPI({
        security: [{ bearerAuth: [] }],
    })
    async chargeAccount(
        @Body() chargeAccount: ChargeAccountDto,
        @CurrentUser() user: JwtPayload,
    ) {
        if (!user.contractor) {
            throw new ForbiddenError('ONLY_CONTRACTORS_ALLOWED');
        }

        const paymentGatewayUrl = await this.#transactionService.chargeAccount(
            chargeAccount,
            user.id,
        );

        return new Response<RequestPackageOutputDto>(true, {
            paymentUrl: paymentGatewayUrl,
        });
    }

    @Post(envs.payping.verifyCallbackEndpoint)
    @OpenAPI({
        security: [{ bearerAuth: [] }],
    })
    @Redirect(`${envs.restApi.frontEndBaseUrl}/payment/:redirectToPath`)
    async verifyChargeAccount(@Body() completedTransaction: PaypingVerifyDto) {
        try {
            const buyCreditService = new ChargeAccountService({
                completedTransaction,
            });
            const result = await buyCreditService.verifyPayment(
                completedTransaction.clientrefid,
            );
            if (result === true) {
                return {
                    redirectToPath: 'callback?status=SUCCESS',
                };
            } else {
                return { redirectToPath: 'callback?status=FAILED' };
            }
        } catch (error) {
            console.error(
                'An error occurred while verifying the payment operation',
            );
            console.dir(error, { depth: 4 });
            if (error instanceof PaymentError) {
                return {
                    redirectToPath: error.redirectUrl,
                };
            }
            return {
                redirectToPath: 'callback?status=FAILED',
            };
        }
    }

    // @Post('/package/:packageId')
    // @OpenAPI({
    //     security: [{ bearerAuth: [] }],
    // })
    // @UseBefore(auth.required)
    // async requestPackage(@Param('packageId') packageId: string) {
    //     const buyPlanService = new BuyPlanService({
    //         packageId,
    //         userId: 'user id',
    //     });
    //     let isCouponCodeValid, couponAmount;
    //     const paymentGatewayUrl = await buyPlanService.requestPayment(
    //         isCouponCodeValid
    //             ? memberShipPlan!.price - couponAmount
    //             : memberShipPlan!.price,
    //         typeof contractor!.user === 'object'
    //             ? contractor?.user?.phoneNumber ?? ''
    //             : '',
    //         typeof contractor!.user === 'object'
    //             ? contractor?.user?.lastname ?? ''
    //             : '',
    //         'خرید بسته حق عضویت',
    //         `${config.api_address}/transactions/verify-package/callback`,
    //         clientRefId,
    //     );
    //     return new Response<RequestPackageOutputDto>(true, {
    //         paymentUrl: paymentGatewayUrl,
    //     });
    // }
    // @Post('/transactions/verify-package/callback')
    // @OpenAPI({
    //     security: [{ bearerAuth: [] }],
    // })
    // @Redirect(`${config.client}/payment/:redirectToPath`)
    // async confirmPackage(@Body() payment: PaypingVerifyDto) {
    //     try {
    //         const buyPlanService = new BuyPlanService({
    //             clientRefId: payment.clientrefid,
    //         });
    //         await buyPlanService.verifyPayment(payment.refid);
    //         return {
    //             redirectToPath: 'callback?type=MEMBER_SHIP_PLAN&status=SUCCESS',
    //         };
    //     } catch (error) {
    //         logger.error(
    //             'An error occurred while verifying the payment operation',
    //             {
    //                 meta: error,
    //             },
    //         );
    //         if (error instanceof PaymentError) {
    //             return {
    //                 redirectToPath: error.redirectUrl,
    //             };
    //         }
    //         return {
    //             redirectToPath: 'callback?status=FAILED',
    //         };
    //     }
    // }

    // @Get('/transactions')
    // @OpenAPI({
    //     security: [{ bearerAuth: [] }],
    // })
    // @UseBefore(auth.required)
    // @ResponseSchema(UserTransactionOutputDto)
    // async userGetTransactions(
    //     @QueryParams() queryString: AdminTransactionFilterDto,
    //     @CurrentUser() user: JwtPayload,
    // ): Promise<Response<UserTransactionOutputDto[]>> | never {
    //     if (!user || !user.contractor) {
    //         throw new ForbiddenError('only_contractors_allowed'.toUpperCase());
    //     }
    //     const { transactions, count } =
    //         await transactionService.userGetTransactions(
    //             'user id',
    //             queryString,
    //             {
    //                 limit: queryString.limit,
    //                 page: queryString.page,
    //                 sort: queryString.sort,
    //                 sortBaseOn: queryString.sortBaseOn,
    //             },
    //         );
    //     return new Response<UserTransactionOutputDto[]>(
    //         true,
    //         transactions.map((transaction) =>
    //             TransactionModel.toUserDto(transaction),
    //         ),
    //         {
    //             meta: {
    //                 count,
    //                 page: queryString.page,
    //                 limit: queryString.limit,
    //             },
    //         },
    //     );
    // }
    // @Get('/admin/transactions')
    // @OpenAPI({
    //     security: [{ bearerAuth: [] }],
    // })
    // @UseBefore(adminAuth.required)
    // @ResponseSchema(AdminTransactionOutputDto)
    // async adminGetTransactions(
    //     @QueryParams() queryString: AdminTransactionFilterDto,
    //     @CurrentUser() user: JwtPayload,
    // ): Promise<Response<AdminTransactionOutputDto[]>> | never {
    //     if (!user || !user.admin) {
    //         throw new ForbiddenError('ONLY_ADMINS_ALLOWED');
    //     }
    //     const { transactions, count } = await transactionService.adminFindAll(
    //         queryString,
    //         {
    //             limit: queryString.limit,
    //             page: queryString.page,
    //             sort: queryString.sort,
    //             sortBaseOn: queryString.sortBaseOn,
    //         },
    //     );
    //     return new Response<AdminTransactionOutputDto[]>(
    //         true,
    //         transactions.map((transaction) =>
    //             TransactionModel.toAdminDto(transaction),
    //         ),
    //         {
    //             meta: {
    //                 page: queryString.page,
    //                 limit: queryString.limit,
    //                 count,
    //             },
    //         },
    //     );
    // }
    // @Post('/admin/transactions')
    // @UseBefore(adminAuth.required)
    // @OpenAPI({
    //     security: [{ bearerAuth: [] }],
    // })
    // @HttpCode(201)
    // @ResponseSchema(AdminTransactionOutputDto)
    // async adminCreateTransaction(
    //     @Body() transaction: CreateTransactionByAdminDto,
    //     @CurrentUser() user: JwtPayload,
    // ) {
    //     if (!user || !user.admin) {
    //         throw new ForbiddenError('ONLY_ADMINS_ALLOWED');
    //     }
    //     const newTransaction = await transactionService.adminCreateTransaction({
    //         amount: transaction.amount,
    //         label: transaction.label,
    //         owner: transaction.owner,
    //         status: transaction?.status ?? TransactionStatus.SUCCESSFUL,
    //         description: transaction.description,
    //     });
    //     return new Response<AdminTransactionOutputDto>(
    //         true,
    //         TransactionModel.toAdminDto(newTransaction),
    //     );
    // }
}
