import {
    AdminDocument,
    AdminModel,
    GuestModel,
    GuestDocument,
    UserModel,
    UserDocument,
} from '../schemas/user.schema';
import { BaseRepository } from './base-repository';

export class UserRepository extends BaseRepository<UserDocument> {
    constructor() {
        super(UserModel);
    }
}
export class AdminRepository extends BaseRepository<AdminDocument> {
    constructor() {
        super(AdminModel);
    }
}
export class GuestRepository extends BaseRepository<GuestDocument> {
    constructor() {
        super(GuestModel);
    }
}
