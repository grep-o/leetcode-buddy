
import { User } from "../../types/index.ts";
import { Collection, Filter } from "npm:mongodb";
import { DatabaseConnection } from "../connection.ts";

export class UserRepository {
    public collection: Collection<User>;

    constructor() {
        const db = DatabaseConnection.getInstance().getDb();
        this.collection = db.collection<User>("users");
    }

    async findByTelegramId(telegramId: number): Promise<User | null> {
        return await this.collection.findOne({ telegramId });
    }

    async findMany(filter: Filter<User>): Promise<User[]> {
        return await this.collection.find(filter).toArray();
    }

    async create(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
        const now = new Date();
        const newUser: User = {
            ...user,
            createdAt: now,
            updatedAt: now,
        };

        await this.collection.insertOne(newUser);
        return newUser;
    }

    async update(telegramId: number, update: Partial<User>): Promise<boolean> {
        const result = await this.collection.updateOne(
            { telegramId },
            {
                $set: {
                    ...update,
                    updatedAt: new Date()
                }
            }
        );
        return result.modifiedCount > 0;
    }

    async delete(telegramId: number): Promise<boolean> {
        const result = await this.collection.deleteOne({ telegramId });
        return result.deletedCount > 0;
    }
}