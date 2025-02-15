export enum UserState {
    // Active states
    ACTIVE = "ACTIVE",                     // Normal active state
    PAUSED = "PAUSED",                     // User temporarily paused notifications
}

export enum ExperienceLevel {
    BEGINNER = "beginner",
    INTERMEDIATE = "intermediate",
    ADVANCED = "advanced"
}

export interface User {
    telegramId: number;
    telegramUsername: string;

    leetcodeUsername: string;

    state: UserState;
    experienceLevel: ExperienceLevel;

    frequency: number;
    tasksCount: number;

    stats: {
        streakCount: number;
        totalSolved: number;
    };

    createdAt: Date; // Registration date
    updatedAt: Date; // Used to update the last time leetcode stats were fetched
}

export type UserInput = Omit<User, 'createdAt' | 'updatedAt'>;