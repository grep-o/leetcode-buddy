import { Context } from "npm:telegraf";

export function helpCommand(ctx: Context) {
    const helpText = `
*LeetCode Study Bot Help*

*General Commands:*
• /start - Start or restart the bot  
• /help - Show this help message  

*Progress & Status:*
• /status - Check your current progress  
• /stats - View your solving statistics  
• /today - Get today's problem suggestion(SOON)
• /skip - Skip today's problem  

*Schedule & Notifications:*
• /schedule - Set your practice schedule  

*Community Features:*
• /groups - Manage your study groups  
• /leaderboard - View the leaderboard  

_Need more assistance? Feel free to ask!_
  `.trim();

    // Define inline keyboard buttons for quick actions.
    const keyboard = {
        inline_keyboard: [
            [
                { text: "Start", callback_data: "/start" },
                { text: "Status", callback_data: "/status" }
            ],
            [
                { text: "Stats", callback_data: "/stats" },
                { text: "Streak", callback_data: "/streak" }
            ],
            [
                { text: "Today", callback_data: "/today" },
                { text: "Skip", callback_data: "/skip" }
            ],
            [
                { text: "Schedule", callback_data: "/schedule" },
                { text: "Groups", callback_data: "/groups" }
            ],
            [
                { text: "Leaderboard", callback_data: "/leaderboard" },
                { text: "Help", callback_data: "/help" }
            ]
        ]
    };

    return ctx.reply(helpText, {
        parse_mode: "Markdown",
        reply_markup: keyboard,
    });
}
