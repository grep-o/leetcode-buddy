import { Context } from "npm:telegraf";
import { UserRepository } from "../../db/repositories/user.ts";

export async function statsCommand(ctx: Context) {
    const userRepo = new UserRepository();
    const telegramId = ctx.from?.id;

    if (!telegramId) {
        return ctx.reply("Could not identify you. Please try again later.");
    }

    try {
        const user = await userRepo.findByTelegramId(telegramId);

        if (!user) {
            return ctx.reply(
                "It seems you are not registered yet. Please use /start to begin the registration process."
            );
        }

        // Extract the stats data.
        const { streakCount, totalSolved } = user.stats;
        const lastCheckInStr = new Date(user.updatedAt).toLocaleString();

        // Build the stats message using HTML formatting with newline characters.
        const statsMessage = `
<b>Your Stats</b>

<b>Solving Streak:</b> ${streakCount}
<b>Total Problems Solved:</b> ${totalSolved}
<b>Last Check-In:</b> ${lastCheckInStr}
    `.trim();

        return ctx.reply(statsMessage, { parse_mode: "HTML" });
    } catch (error) {
        console.error("Error in /stats command:", error);
        return ctx.reply("Sorry, something went wrong while fetching your stats. Please try again later.");
    }
}
