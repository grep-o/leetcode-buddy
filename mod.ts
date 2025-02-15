import './src/configs/env.ts'
import { LeetCodeBot } from "./src/bot/index.ts";
import { DatabaseConnection } from "./src/db/connection.ts";

DatabaseConnection.getInstance().connect()
    .then(() => new LeetCodeBot().start())
    .then(() => console.log(`Successfully launched Leetcode Buddy`))
    .catch(() => {
        console.error(`Failed to start instance`);
        Deno.exit(1);
    })