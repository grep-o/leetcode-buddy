import axios from "npm:axios";
import { LeetcodeUserInfo } from "./types.ts";

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

// GraphQL query to fetch user profile and submission statistics.
const USER_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        realName
        userAvatar
        reputation
        ranking
        countryName
        aboutMe
      }
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
    }
  }
`;

/**
 * Fetches LeetCode user information by username.
 *
 * @param username - The LeetCode username to query.
 * @returns A promise resolving to the user data, or null if no user is found.
 * @throws An error if the request fails or if LeetCode returns errors.
 */
export async function getUserLeetcodeInfo(username: string): Promise<LeetcodeUserInfo> {
    try {
        const response = await axios.post(LEETCODE_GRAPHQL_URL, {
            query: USER_QUERY,
            variables: { username },
        });

        // Check for errors returned by the GraphQL API.
        if (response.data.errors) {
            throw new Error(`GraphQL errors: ${JSON.stringify(response.data.errors)}`);
        }

        // Return the matched user info.
        return response.data.data.matchedUser;
    } catch (error) {
        console.error(`Error fetching LeetCode info for "${username}":`, error);
        throw error;
    }
}
