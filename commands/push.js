const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");

const {
    ensureInitialized,
    ensureLoggedIn,
    ensureRemoteConfigured,
    ensureCommitExists,
} = require("../utils/cliValidation");

const { authFilePath } = require("../utils/globalConfig");
const { API_URL } = require("../config/api");

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_PUSH_SIZE = 50 * 1024 * 1024;

// FORMAT BYTES
function formatBytes(bytes) {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

// GET ALL FILES
async function getAllFiles(dirPath) {
    let files = [];
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dirPath, item.name);

        if (item.isDirectory()) {
            const nestedFiles = await getAllFiles(fullPath);
            files = [...files, ...nestedFiles];
        } else {
            files.push(fullPath);
        }
    }

    return files;
}

// PUSH REPOSITORY
async function pushRepo() {
    try {
        // VALIDATIONS
        if (!(await ensureInitialized())) return;
        if (!(await ensureLoggedIn())) return;
        if (!(await ensureRemoteConfigured())) return;
        if (!(await ensureCommitExists())) return;

        // READ AUTH
        const auth = JSON.parse(await fs.readFile(authFilePath, "utf-8"));

        // REPO CONFIG
        const repoCorePath = path.join(process.cwd(), ".repocore");
        const configPath = path.join(repoCorePath, "config.json");
        const config = JSON.parse(await fs.readFile(configPath, "utf-8"));

        // INIT PUSH TRACKING
        if (!config.pushedCommits) {
            config.pushedCommits = [];
        }

        // COMMITS PATH
        const commitsPath = path.join(repoCorePath, "commits");
        let commitFolders = await fs.readdir(commitsPath);

        if (commitFolders.length === 0) {
            console.log("No commits found.");
            return;
        }

        // FIND UNPUSHED COMMITS
        const unpushedCommits = commitFolders.filter(
            (commitHash) => !config.pushedCommits.includes(commitHash)
        );

        if (unpushedCommits.length === 0) {
            console.log("Everything up-to-date.");
            return;
        }

        let totalPushSize = 0;

        // PUSH COMMITS
        for (const commitHash of unpushedCommits) {
            console.log(`\nPushing commit: ${commitHash}`);
            const commitPath = path.join(commitsPath, commitHash);

            // READ COMMIT INFO
            const commitInfo = JSON.parse(
                await fs.readFile(path.join(commitPath, "commit.json"), "utf-8")
            );

            // GET FILES
            const allFiles = await getAllFiles(commitPath);
            const filesPayload = [];

            // PROCESS FILES
            for (const filePath of allFiles) {
                // SKIP INTERNAL FILE
                if (path.basename(filePath) === "commit.json") {
                    continue;
                }

                // RELATIVE PATH
                const relativePath = path.relative(commitPath, filePath);

                // WINDOWS FIX
                const normalizedPath = relativePath.replace(/\\/g, "/");

                // SKIP NODE_MODULES
                if (normalizedPath.includes("node_modules")) {
                    continue;
                }

                // FILE CONTENT
                const fileContent = await fs.readFile(filePath);
                const fileSize = fileContent.length;

                // FILE SIZE CHECK
                if (fileSize > MAX_FILE_SIZE) {
                    console.log(`Skipped: ${normalizedPath}`);
                    console.log(`Reason: File exceeds ${formatBytes(MAX_FILE_SIZE)}`);
                    continue;
                }

                // TOTAL SIZE CHECK
                totalPushSize += fileSize;

                if (totalPushSize > MAX_PUSH_SIZE) {
                    console.log("\nPush aborted!");
                    console.log(`Total repository size exceeded ${formatBytes(MAX_PUSH_SIZE)}`);
                    return;
                }

                // ADD FILE TO PAYLOAD
                filesPayload.push({
                    filename: path.basename(filePath),
                    filepath: normalizedPath,
                    content: fileContent.toString("base64"),
                    size: fileSize,
                });

                console.log(`Prepared: ${normalizedPath}`);
            }

            // SEND TO BACKEND
            await axios.post(
                `${API_URL}/commit/push`,
                {
                    repositoryId: config.repositoryId,
                    commitHash,
                    commitMessage: commitInfo.message,
                    files: filesPayload,
                },
                {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                    },
                }
            );

            // MARK PUSHED
            config.pushedCommits.push(commitHash);
            console.log(`Commit pushed: ${commitHash}`);
        }

        // SAVE CONFIG
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));

        console.log(`\nTotal uploaded size: ${formatBytes(totalPushSize)}`);
        console.log("\nRepository pushed successfully!");

    } catch (err) {
        console.error(
            "Push failed:",
            err.response?.data?.error || err.message
        );
    }
}

module.exports = {
    pushRepo,
};