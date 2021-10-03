export enum NodeEnv {
    production = 'production',
    development = 'development',
}

export const envs: {
    mongodb: {
        dbConnectionString: string;
    };
    nodeEnv: NodeEnv;
    payping: {
        baseUrl: string;
        token: string;
        clientRefIdLength: number;
        verifyCallbackEndpoint: string;
    };
    restApi: {
        frontEndBaseUrl: string;
        baseUrl: string;
    };
} = {
    restApi: {
        baseUrl: process.env?.REST_API_BASE_URL ?? '',
        frontEndBaseUrl:
            process.env?.FRONT_END_BASE_URL ?? 'https://localhost:5000/',
    },
    mongodb: {
        dbConnectionString: process.env?.MONGODB_URI ?? '',
    },
    nodeEnv: (process.env?.NODE_ENV as NodeEnv) ?? NodeEnv.development,
    payping: {
        baseUrl: process.env?.PAYPING_BASE_URL ?? '',
        token: process.env?.PAYPING_TOKEN ?? '',
        clientRefIdLength: Number(process.env?.CLIENT_REF_ID_LENGTH ?? '10'),
        verifyCallbackEndpoint:
            process.env?.VERIFY_CALLBACK_ENDPOINT ??
            '/transactions/charge-account/payping-callback',
    },
};
