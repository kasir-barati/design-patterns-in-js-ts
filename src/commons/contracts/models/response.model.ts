interface Meta {
    page: number;
    limit: number;
    count: number;
}

interface Optional {
    message?: string | string[];
    meta?: Meta;
}

export class Response<T> {
    successful: boolean;
    // message can be the error messages/message, and also common messages/message
    message?: string | string[];
    data: T;
    meta?: Meta;

    constructor(success: boolean, data: T, optional?: Optional) {
        this.successful = success;
        this.data = data;
        if (optional?.message) {
            this.message =
                typeof optional.message === 'string'
                    ? optional.message.toUpperCase()
                    : optional.message.map((message) => message.toUpperCase());
        }
        if (optional?.meta) {
            this.meta = optional.meta;
        }
    }
}
