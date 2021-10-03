export class JwtPayload {
    admin?: boolean;
    contractor?: boolean;
    phoneNumber?: string;
    step?: string; // TODO: set enum
    username?: string;
    id: string;
    exp: number;
}
