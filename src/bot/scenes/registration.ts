import { Context, Scenes } from "npm:telegraf";
import { UserRepository } from "../../db/repositories/user.ts";
import { ExperienceLevel, UserInput, UserState } from "../../types/index.ts";
import { getUserLeetcodeInfo } from "../../modules/leetcode.ts";
import { LeetcodeUserInfo } from "../../modules/types.ts";

// 1. Define an interface for your custom wizard state.
interface RegistrationWizardState {
    leetcodeUsername?: string;
    experienceLevel?: ExperienceLevel;
    scheduleInterval?: "daily" | "weekly";
    tasksCount?: number;
    leetcodeInfo?: LeetcodeUserInfo
}

// 2. Define a minimal session data interface that holds your custom state.
interface MySessionData {
    state: RegistrationWizardState;
    cursor: number;
}

// 3. Define a custom context that extends Telegraf’s Context and includes:
//    - session: the scene session with our custom session data
//    - scene: the scene context (parameterized with our custom session data)
//    - wizard: the wizard context helper
interface MyContext extends Context {
    session: Scenes.SceneSession<MySessionData>;
    scene: Scenes.SceneContextScene<MyContext, MySessionData>;
    wizard: Scenes.WizardContextWizard<MyContext>;
}

// Helper function to check if the user typed "/exit" and, if so, exit the scene.
async function checkExit(ctx: MyContext): Promise<boolean> {
    if (ctx.message && "text" in ctx.message) {
        const text = (ctx.message as { text: string }).text.trim();
        if (text === "/exit") {
            await ctx.reply("🚪 Exiting registration. Come back anytime for more coding fun!");
            await ctx.scene.leave();
            return true;
        }
    }
    return false;
}


// 4. Create the wizard scene using MyContext as the generic argument.
//    The registration wizard now consists of 6 steps:
//    Step 1: Ask for the LeetCode username.
//    Step 2: Validate username & fetch LeetCode info.
//    Step 3: Ask for the experience level.
//    Step 4: Ask for schedule interval (daily/weekly).
//    Step 5: Ask for the number of tasks per day.
//    Step 6: Finalize registration.
export const registrationWizard = new Scenes.WizardScene<MyContext>(
    "registration-wizard",

    // Step 1: Ask for the LeetCode username.
    async (ctx) => {
        const userRepo = new UserRepository();
        const telegramId = ctx.from?.id;
        if (!telegramId) return ctx.reply("🤔 How did you hide your id? I can't see you.");

        const user = await userRepo.findByTelegramId(telegramId);
        if (user) return ctx.reply(`Hey ${user.telegramUsername}, you're already registered!`);

        await ctx.reply(
            "👋 Hey there! Welcome to the LeetCode Buddy Bot! 🚀\n" +
            "Let's kick off your coding adventure. What's your LeetCode username?\n\n" +
            "Type /exit if you change your mind."
        );
        return ctx.wizard.next();
    },

    // Step 2: Receive and validate the LeetCode username.
    async (ctx) => {
        if (await checkExit(ctx)) return;

        if (!ctx.message || !("text" in ctx.message)) {
            await ctx.reply("😕 Oops! I didn't catch that. Please type your LeetCode username.");
            return;
        }
        const leetcodeUsername = (ctx.message as { text: string }).text.trim();
        if (!leetcodeUsername) {
            await ctx.reply("😅 Looks like that was empty. Please send your LeetCode username.");
            return;
        }

        await ctx.reply("⏳ Hold on, fetching your LeetCode stats...");
        const info = await getUserLeetcodeInfo(leetcodeUsername)
            .catch(async () => {
                await ctx.reply("😔 Hmm... I couldn't find any LeetCode profile matching that username. Please try again or type /exit to cancel.");
            });
        if (!info) return;

        // Save the username in our custom state.
        (ctx.wizard.state as RegistrationWizardState).leetcodeUsername = leetcodeUsername;
        (ctx.wizard.state as RegistrationWizardState).leetcodeInfo = info;
        await ctx.reply(
            `🎉 Awesome! I found your profile with a ranking of #${info.profile.ranking}.\n\n` +
            `Now, can you tell me your experience level? (Options: ${Object.values(ExperienceLevel).join(', ')})`
        );
        return ctx.wizard.next();
    },

    // Step 3: Receive and validate the experience level.
    async (ctx) => {
        if (await checkExit(ctx)) return;

        if (!ctx.message || !("text" in ctx.message)) {
            await ctx.reply("😕 Please type your experience level so we can tailor your journey.");
            return;
        }
        const expInput = (ctx.message as { text: string }).text.trim().toLowerCase();
        if (!Object.values(ExperienceLevel).includes(expInput as ExperienceLevel)) {
            await ctx.reply("🤔 That doesn't match any valid experience level. Please choose: beginner, intermediate, or advanced.");
            return;
        }

        // Save the experience level in our custom state.
        (ctx.wizard.state as RegistrationWizardState).experienceLevel = expInput as ExperienceLevel;
        await ctx.reply(
            `Great! You are registered as a(n) ${expInput} coder.\n` +
            "Next, how often do you want to solve problems? Type 'daily' or 'weekly'."
        );
        return ctx.wizard.next();
    },

    // Step 4: Ask for schedule interval (daily or weekly).
    async (ctx) => {
        if (await checkExit(ctx)) return;

        if (!ctx.message || !("text" in ctx.message)) {
            await ctx.reply("😕 Please type 'daily' or 'weekly' to set your problem-solving interval.");
            return;
        }
        const intervalInput = (ctx.message as { text: string }).text.trim().toLowerCase();
        if (intervalInput !== "daily" && intervalInput !== "weekly") {
            await ctx.reply("🤔 That doesn't seem right. Please type exactly 'daily' or 'weekly'.");
            return;
        }

        // Save the schedule interval in our custom state.
        (ctx.wizard.state as RegistrationWizardState).scheduleInterval = intervalInput as "daily" | "weekly";
        await ctx.reply(
            `Cool! You'll be solving problems on a ${intervalInput} basis.\n` +
            "Now, how many tasks per day do you want to tackle? (Enter a number, e.g. 2)"
        );
        return ctx.wizard.next();
    },

    // Step 5: Ask for the number of tasks per day and finalize registration.
    async (ctx) => {
        if (await checkExit(ctx)) return;

        if (!ctx.message || !("text" in ctx.message)) {
            await ctx.reply("😕 Please type a number for how many tasks you want to solve each day.");
            return;
        }

        const tasksInput = (ctx.message as { text: string }).text.trim();
        const tasksCount = Number(tasksInput);
        if (!Number.isFinite(tasksCount) || tasksCount <= 0) {
            await ctx.reply("🤔 That doesn't seem like a valid number. Please enter a positive number (>0).");
            return;
        }

        // Save tasksCount
        (ctx.wizard.state as RegistrationWizardState).tasksCount = tasksCount;
        await ctx.reply(`Noted! Finalizing your registration...`);

        // Now finalize registration (finalization logic from step 6)
        const { leetcodeUsername, experienceLevel, scheduleInterval, leetcodeInfo } = ctx.wizard.state as RegistrationWizardState;
        if (!leetcodeUsername || !experienceLevel || !scheduleInterval || tasksCount === undefined) {
            await ctx.reply("😢 Oops! Something went wrong – some of your information is missing. Let's start over.");
            return ctx.scene.leave();
        }

        const telegramId = ctx.from?.id;
        if (!telegramId) {
            await ctx.reply("😞 I couldn't identify you. Please try again later.");
            return ctx.scene.leave();
        }

        const frequency = scheduleInterval === "daily" ? 1 : 7;
        const allSubmissions = leetcodeInfo?.submitStats.acSubmissionNum.find(item => item.difficulty === "All");
        const newUser: UserInput = {
            telegramId,
            telegramUsername: ctx.from.username || "",
            leetcodeUsername,
            state: UserState.ACTIVE,
            experienceLevel,
            frequency,
            tasksCount,
            stats: { streakCount: 0, totalSolved: allSubmissions?.count ?? 0 },
        };

        try {
            const userRepo = new UserRepository();
            await userRepo.create(newUser);
            await ctx.reply(
                `🎊 Registration complete!\n\n` +
                `Cool, I'll check your stats ${scheduleInterval} (${frequency} day(s)) and if you miss your task, I'll start pinging you. Let's grow together! 🚀\n\n` +
                `Type /help to explore more features and join the coding fun!`
            );
        } catch (error) {
            console.error("Error saving user registration:", error);
            await ctx.reply("😓 Something went wrong during registration. Please try again later.");
        }
        return ctx.scene.leave();
    }
);

