import { load } from "../../deps.ts";

const env = await load();


for (const [key, value] of Object.entries(env)) {
    Deno.env.set(key, value);
}