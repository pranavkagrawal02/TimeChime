const path = require("path");
const { createJsonStore } = require("./json-store");

function createStore(rootDir) {
  return createJsonStore({ dbPath: path.join(rootDir, "db.json") });
}

module.exports = { createStore };
