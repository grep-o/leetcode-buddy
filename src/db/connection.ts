import { MongoClient, Db } from "npm:mongodb";

export class DatabaseConnection {
    private static instance: DatabaseConnection;
    private client: MongoClient | null = null;
    private db: Db | null = null;

    private constructor() { }

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) DatabaseConnection.instance = new DatabaseConnection();

        return DatabaseConnection.instance;
    }

    public async connect(): Promise<void> {
        if (this.client) return

        try {
            const uri = Deno.env.get("MONGODB_DB_URI");
            const name = Deno.env.get("MONGODB_DB_NAME");

            if (!uri) throw Error("MongoDB URI is missing");
            if (!name) throw Error("MongoDB NAME is missing");

            this.client = new MongoClient(uri);
            await this.client.connect();
            this.db = this.client.db(name);
            console.log("Successfully connected to MongoDB.");
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
            throw error;
        }
    }

    public getClient(): MongoClient {
        if (!this.client) {
            throw new Error("Database not connected. Call connect() first.");
        }
        return this.client;
    }

    public getDb(): Db {
        if (!this.db) throw new Error("Database not connected. Call connect() first.");

        return this.db;
    }

    public async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
            console.log("Disconnected from MongoDB.");
        }
    }
}