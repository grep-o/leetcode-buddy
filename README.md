# LeetCode Buddy

[LeetCode Buddy](http://t.me/leetcodebuddy_bot) is a Telegram bot designed to help developers maintain a consistent LeetCode practice routine. The bot assigns daily (or weekly) problem challenges, tracks your progress and streaks, and even provides friendly reminders and motivation to keep you on track.

## Features

- **User Registration & Onboarding:**  
  Easily register with your Telegram account and LeetCode username. The bot verifies your LeetCode profile and sets up your coding journey.

- **Daily/Weekly Problem Assignments:**  
  Get problem suggestions based on your experience level and chosen schedule (daily or weekly).

- **Progress Tracking:**  
  Monitor your problem-solving streaks, total solved problems, and performance metrics.

- **Notifications & Reminders:**  
  Receive friendly reminders if you miss a task. If you’re ahead, the bot will congratulate you!

- **Community & Fun:**  
  Enjoy a fun, interactive experience with playful messages, emojis, and a supportive coding community vibe.

## Tech Stack

- **Runtime:** Deno (leveraging modern JavaScript/TypeScript)
- **Bot Framework:** Telegraf (Telegram Bot API)
- **Database:** MongoDB (for user data and progress tracking)
- **Language:** TypeScript (ensuring type safety and developer productivity)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/leetcode-buddy.git
   cd leetcode-buddy
   ```

2. **Set up environment variables:**  
   Create a `.env` file (or set environment variables in your deployment environment). See [.env.local](.env.local)

3. **Install Deno (if you haven't already):**  
   Follow the instructions at [deno.land](https://deno.land/#installation).

## Running the Bot

To run the bot with Deno, use the following command:

```bash
deno task start
```

The flags provided ensure the bot has access to network resources, environment variables, and files. Adjust permissions as needed for your deployment.

## Development

- **Type-check your code:**

  ```bash
  deno check .
  ```

- **Lint your code:**

  ```bash
  deno lint
  ```

- **Run without executing:**

  ```bash
  deno task start
  ```

## Usage

- **/start:**  
  Begin the registration process. You’ll be asked for your LeetCode username, experience level, and your preferred schedule and task count.

- **/help:**  
  Get a list of available commands and learn how to use the bot.

- **/status, /stats, /skip:**  
  Check your progress, view your statistics, or skip today’s problem if needed.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request. Please follow the project's code style and ensure your code passes type checks and linting.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.