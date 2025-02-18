import { Context, MiddlewareFn, Scenes } from "npm:telegraf";
import { session, Telegraf } from "../../deps.ts";
import { DatabaseConnection } from "../db/connection.ts";
import { UserRepository } from "../db/repositories/user.ts";
import { helpCommand } from "./commands/help.ts";
import { statsCommand } from "./commands/stats.ts";
import { registrationWizard } from "./scenes/registration.ts";
import { getUserLeetcodeInfo } from "../modules/leetcode.ts";
import { User } from "../types/index.ts";
import { CallbackQuery, Update } from "npm:telegraf/types";

export class LeetCodeBot {
  private bot: Telegraf;
  private userRepo: UserRepository;

  constructor() {
    const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!token)
      throw Error(
        "TELEGRAM_BOT_TOKEN is missing. Try setting in .env as `TELEGRAM_BOT_TOKEN=your_token`"
      );

    this.bot = new Telegraf(token);
    this.userRepo = new UserRepository();

    // Set up middleware
    this.setupMiddleware();

    // Register commands
    this.registerCommands();

    // Set up error handling
    this.setupErrorHandling();

    // Setup checker
    this.setupChecker();
  }

  private setupMiddleware() {
    // Use session middleware first
    this.bot.use(session());

    // Create and use the stage middleware
    const stage = new Scenes.Stage([registrationWizard]);
    this.bot.use(
      stage.middleware() as never as MiddlewareFn<Context<Update>, Update>
    );

    // Log middleware
    this.bot.use(async (ctx, next) => {
      const start = Date.now();
      await next();
      const ms = Date.now() - start;
      console.log(`[${ctx.updateType}] Response time: ${ms}ms`);
    });
  }

  private registerCommands() {
    this.bot.command("start", (ctx) =>
      (ctx as unknown as Scenes.SceneContext).scene.enter("registration-wizard")
    );

    // TODO add skip command
    // TODO add reschedule logic

    this.bot.command("help", helpCommand);
    this.bot.command("stats", statsCommand);

    this.bot.on("callback_query", async (ctx) => {
      const command = (ctx.callbackQuery as unknown as CallbackQuery.DataQuery)
        .data;

      await ctx.answerCbQuery();

      switch (command) {
        case "/start":
          await (ctx as never as Scenes.SceneContext).scene.enter(
            "registration-wizard"
          );
          break;
        case "/help":
          await helpCommand(ctx);
          break;
        case "/stats":
          await statsCommand(ctx);
          break;
        default:
          await ctx.reply(
            "Unknown command. Please use /help to see available commands."
          );
      }
    });
  }

  private setupErrorHandling() {
    this.bot.catch((err, ctx) => {
      console.error(`Error for ${ctx.updateType}:`, err);
      ctx.reply("An error occurred. Please try again later.");
    });
  }

  private setupChecker() {
    const HOUR = 60 * 60 * 1000;

    setInterval(async () => {
      const users = await this.userRepo.collection.find().toArray();
      for (const user of users) {
        await this.checkUser(user);
      }
    }, HOUR);
  }

  private async checkUser(user: User) {
    try {
      console.log(`Checking for ${user.telegramId}`);
      if (user.nextDueDate && Date.now() < user.nextDueDate.getTime()) return;

      const updatedInfo = await getUserLeetcodeInfo(
        user.leetcodeUsername
      ).catch(() => null);
      if (!updatedInfo) return; // Optionally handle later

      // Get the overall submission stats (for "All" difficulty)
      const allSubmissions = updatedInfo.submitStats.acSubmissionNum.find(
        (item: { difficulty: string }) => item.difficulty === "All"
      );
      if (!allSubmissions) {
        console.error(
          `Could not find submissions for leetcodeUsername: ${user.leetcodeUsername}`
        );
        return;
      }

      // Compute "missing" as the difference between expected count and what the user achieved.
      // If your intended logic is that a positive "missing" means the user is behind,
      // you might compute it as:
      const missing =
        allSubmissions.count - (user.stats.totalSolved + user.tasksCount);

      console.log(`Sending message to ${user.telegramId}`);

      // Send a message based on the computed value.
      if (missing > 0) {
        // User has missed some tasks.
        await this.bot.telegram.sendMessage(
          user.telegramId,
          `Hey ${user.telegramUsername}, it looks like you missed ${missing} problem(s) that you were supposed to solve today. Let's get back on track and conquer those challenges! 💪`
        );
      } else if (missing === 0) {
        // User is exactly on track.
        await this.bot.telegram.sendMessage(
          user.telegramId,
          `Good job ${user.telegramUsername}, you're right on track today! Keep up the great work! 👍`
        );
      } else if (Math.abs(Math.round(missing / user.tasksCount)) >= 2) {
        // If the user is ahead by a significant margin (using absolute value in case missing is negative),
        // congratulate them.
        await this.bot.telegram.sendMessage(
          user.telegramId,
          `YOU'RE A BEAST, ${user.telegramUsername}! You're crushing it and surpassing your targets! 🚀`
        );
      }

      await this.userRepo.update(user.telegramId, {
        stats: {
          totalSolved: allSubmissions.count,
          streakCount: user.stats.streakCount + 1,
        },
        updatedAt: new Date(),
        nextDueDate: new Date(Date.now() + user.frequency * 24 * 60 * 60_000),
      });
    } catch (error) {
      console.error("Error during daily check:", error);
    }
  }

  public async start() {
    try {
      console.log(`Connecting bot...`);
      await this.bot.launch(() => console.log("Bot is running..."));

      const signals = ["SIGTERM", "SIGINT"];
      for (const signal of signals)
        Deno.addSignalListener(signal as Deno.Signal, () => this.stop());
    } catch (error) {
      console.error("Failed to start bot:", error);
      throw error;
    }
  }

  public async stop() {
    try {
      await this.bot.stop();
      await DatabaseConnection.getInstance().disconnect();
      console.log("Bot stopped gracefully");
      Deno.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error);
      Deno.exit(1);
    }
  }
}
