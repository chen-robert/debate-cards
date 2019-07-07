const connectionString = process.env.DEBATE_CARDS_DB_URL || process.env.DATABASE_URL || "postgresql://postgres:nike@localhost:5432/cardscraper";

module.exports = {connectionString};