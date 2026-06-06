const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");
const { API_URL } = require("../config/api");

// CLEAR WORKING DIRECTORY
async function clearWorkingDirectory(workingDir) {
    const items = await fs.readdir(workingDir, { withFileTypes: true });

    for (const item of items) {
        if (item.name === ".repocore" || item.name === "node_modules" || item.name === ".git") continue;

        const fullPath = path.join(workingDir, item.name);

        if (item.isDirectory()) {
            await fs.rm(fullPath, { recursive: true, force: true });
        } else {
            await fs.unlink(fullPath);
        }
    }
}

// CLONE REPOSITORY
async function cloneRepo(remoteUrl) {
    try {
        // URL validation
        if (!remoteUrl.startsWith("repocore://")) {
            console.log("\nInvalid remote URL.");
            console.log("Example:");
            console.log("repocore://username/reponame\n");
            return;
        }

        // Parse URL
        const cleanUrl = remoteUrl.replace("repocore://", "");
        const [username, repositoryName] = cleanUrl.split("/");
        if (!username || !repositoryName) {
            console.log("Invalid remote format.");
            return;
        }

        console.log("\nCloning repository...");

        // Optional auth (for private repos)
        let auth = null;
        try {
            const authPath = path.join(process.env.HOME || process.env.USERPROFILE, ".repocore", "auth.json");
            const authData = await fs.readFile(authPath, "utf-8");
            auth = JSON.parse(authData);
        } catch {
            // no login, public repos still allowed
        }

        // Fetch repository from backend
        const repoResponse = await axios.get(
            `${API_URL}/repo/${username}/${repositoryName}`,
            auth?.token ? { headers: { Authorization: `Bearer ${auth.token}` } } : {}
        );
        const repository = repoResponse.data;

        if (!repository) {
            console.log("Repository not found!");
            return;
        }

        // Create project folder
        const projectPath = path.join(process.cwd(), repository.name);
        await fs.mkdir(projectPath, { recursive: true });

        // Create .repocore folder
        const repoCorePath = path.join(projectPath, ".repocore");
        await fs.mkdir(path.join(repoCorePath, "commits"), { recursive: true });
        await fs.mkdir(path.join(repoCorePath, "staging"), { recursive: true });

        // Save config
        const config = {
            remote: remoteUrl,
            repositoryName: repository.name,
            repositoryOwner: username,
            repositoryId: repository._id,
        };
        await fs.writeFile(path.join(repoCorePath, "config.json"), JSON.stringify(config, null, 2));

        console.log("Repository initialized");

        // Stop if empty repo
        if (!repository.latestCommit?._id) {
            console.log("Repository is empty");
            return;
        }

        // Fetch latest commit files from backend
        const commitResponse = await axios.get(`${API_URL}/commit/${repository.latestCommit._id}/files`);
        const files = commitResponse.data;

        console.log("Downloading files...");

        // Clear working directory before cloning
        await clearWorkingDirectory(projectPath);

        // Download each file through backend API
        let current = 1;
        for (const file of files) {
            const fileResponse = await axios.get(`${API_URL}/file/download`, {
                params: { key: file.s3Key },
                responseType: "arraybuffer",
                headers: auth?.token ? { Authorization: `Bearer ${auth.token}` } : {},
            });

            const relativePath = file.filepath || file.filename;
            const localFilePath = path.join(projectPath, relativePath);

            await fs.mkdir(path.dirname(localFilePath), { recursive: true });
            await fs.writeFile(localFilePath, fileResponse.data);

            console.log(`[${current}/${files.length}] Downloaded ${relativePath}`);
            current++;
        }

        console.log("\nClone completed successfully!");
    } catch (err) {
        console.error("Clone failed:", err.response?.data?.message || err.message);
    }
}

module.exports = { cloneRepo };