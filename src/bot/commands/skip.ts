import { Context } from "npm:telegraf";
import { UserRepository } from "../../db/repositories/user.ts";
import { ONE_DAY } from "../../modules/constants.ts";

export async function skipCommand(ctx: Context) {
  const userRepo = new UserRepository();
  const telegramId = ctx.from?.id;

  if (!telegramId) return ctx.reply("Could not identify you. Please try again later.");

  const user = await userRepo.findByTelegramId(telegramId);
  if (!user) return ctx.reply("It seems you are not registered yet. Please use /start to begin the registration process.");

  if (Date.now() < user.nextDueDate.getTime()) {
    const statsMessage = `I won't skip this since you still have time. Keep working on it and remember why you started!`.trim();
    return ctx.reply(statsMessage, { parse_mode: "HTML" });
  }

  await userRepo.update(telegramId, { nextDueDate: new Date(Date.now() + user.frequency * ONE_DAY), skippedCount: (user.skippedCount ?? 0) + 1 });

  const statsMessage = `No worries! We'll skip for this time 👍`.trim();
  return ctx.reply(statsMessage, { parse_mode: "HTML" });
}
