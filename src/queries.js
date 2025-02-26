// Export GraphQL queries

export const GET_USER_SKILLS = `
query GetUserSkills($userId: Int!) {
    user(where: { id: { _eq: $userId } }) {
        transactions(
            where: {
                type: { _in: ["skill_js", "skill_go", "skill_php", "skill_prog", "skill_front-end", "skill_back-end"] }
            }
            order_by: [{ type: desc }]
            distinct_on: [type]
        ) {
            type
            amount
            createdAt
        }
    }
}
`;

export const GET_USER_LEVEL = `
query GetUserLevel($userId: Int!) {
    event_user(where: { userId: { _eq: $userId }, eventId: { _eq: 20 } }) {
        level
    }
}
`;

export const GET_USER_TOTAL_XP = `
query GetUserTotalXP($userId: Int!) {
    user(where: { id: { _eq: $userId } }) {
        transactions_aggregate(where: { type: { _eq: "xp" }, eventId: { _eq: 20 } }) {
            aggregate {
                sum {
                    amount
                }
            }
        }
    }
}
`;

// Add more queries as needed 