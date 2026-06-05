const os = require("os");
const path = require("path");

const globalRepoCorePath = path.join(os.homedir(), ".repocore");
const authFilePath = path.join(globalRepoCorePath, "auth.json");

module.exports = {
    globalRepoCorePath,
    authFilePath,
};