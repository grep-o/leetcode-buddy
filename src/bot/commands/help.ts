import { Context } from "npm:telegraf";

// TODO add
// schedule(change the frequency)
// task - to get relevant task
// leaderboard - View the leaderboard
// group - to redirect to group

export function helpCommand(ctx: Context) {
  const helpText = `
*LeetCode Study Bot Help*

*General Commands:*
• /start - Start or restart the bot  
• /help - Show this help message  

*Progress & Status:*
• /stats - View your solving statistics  
• /skip - Skip today's problem  

_Need more assistance? Feel free to ask!_
  `.trim();

  // Define inline keyboard buttons for quick actions.
  const keyboard = {
    inline_keyboard: [
      [
        { text: "Start", callback_data: "/start" },
        { text: "Status", callback_data: "/status" },
      ],
      [
        { text: "Stats", callback_data: "/stats" },
        { text: "Skip", callback_data: "/skip" },
      ],
    ],
  };

  return ctx.reply(helpText, {
    parse_mode: "Markdown",
    reply_markup: keyboard,
  });
}
