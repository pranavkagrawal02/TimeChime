const path = require("path");
const { createJsonStore } = require("./json-store");
const { createPostgresStore } = require("./postgres-store");

function createStore(rootDir) {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    return createPostgresStore({ connectionString });
  }

  return createJsonStore({ dbPath: path.join(rootDir, "db.json") });
}

module.exports = { createStore };
