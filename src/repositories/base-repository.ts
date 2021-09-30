import {
    Document,
    Model,
    FilterQuery,
    QueryOptions,
    UpdateQuery,
    DocumentDefinition,
} from 'mongoose';

export class BaseRepository<T extends Document> {
    model: Model<T>;
    constructor(model: Model<T>) {
        this.model = model;
    }

    async create(body: DocumentDefinition<T>): Promise<T> {
        return await this.model.create(body);
    }

    async aggregate(pipeline: any[] | undefined) {
        return await this.model.aggregate(pipeline).exec();
    }

    async countDocuments(query: FilterQuery<T>): Promise<number> {
        return await this.model.countDocuments(query).exec();
    }

    async delete(id: string): Promise<T | null> {
        // TODO type of id can be number
        return await this.model.findByIdAndDelete(id).exec();
    }

    async findOne(
        query: FilterQuery<T>,
        projection = { __v: 0 },
        options: QueryOptions = { lean: true },
    ): Promise<T | null> {
        return await this.model
            .findOne(query, projection, options)
            .select({ __v: 0 })
            .exec();
    }

    async find(
        query: FilterQuery<T>,
        projection = { __v: 0 },
        sort: { [x: string]: number } = { createdAt: -1 },
        options: QueryOptions = { lean: true },
    ): Promise<T[]> {
        return await this.model
            .find(query, projection, options)
            .sort(sort)
            .select({ __v: 0 })
            .exec();
    }

    async findById(
        id: string, //TODO id can be number
        projection = { __v: 0 },
        options: QueryOptions = { lean: true },
    ): Promise<T | null> {
        return await this.model.findById(id, projection, options).exec();
    }

    async update(
        id: string, //TODO id can be number
        body: UpdateQuery<T>,
        options: QueryOptions = { lean: true, new: true },
    ): Promise<T | null> {
        return await this.model.findByIdAndUpdate(id, body, options).exec();
    }
}
