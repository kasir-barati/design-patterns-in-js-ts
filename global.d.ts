import { JwtPayload } from './src/contracts/types/jwt-payload.type';

declare global {
    namespace Express {
        export interface Request {
            payload?: JwtPayload;
            options?: any;
        }
    }

    type DeepPartial<T> = {
        [P in keyof T]?: DeepPartial<T[P]>;
    };
}
