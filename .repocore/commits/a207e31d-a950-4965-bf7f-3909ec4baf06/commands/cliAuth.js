const fs = require("fs").promises;
const axios = require("axios");

const { globalRepoCorePath, authFilePath } = require("../utils/globalConfig");
const { API_URL } = require("../config/api");

// LOGIN
async function cliLogin(email, password) {
    try {
        // LOGIN REQUEST
        const response = await axios.post(`${API_URL}/login`, {
            email,
            password,
        });

        // CREATE GLOBAL DIR
        await fs.mkdir(globalRepoCorePath, { recursive: true });

        // SAVE AUTH
        await fs.writeFile(
            authFilePath,
            JSON.stringify(
                {
                    token: response.data.token,
                    userId: response.data.userId,
                },
                null,
                2
            )
        );

        console.log("Logged in successfully!");
        console.log(`Auth saved at:\n${authFilePath}`);
    } catch (err) {
        console.error(
            "Login failed:",
            err.response?.data?.error || err.message
        );
    }
}

module.exports = { cliLogin };