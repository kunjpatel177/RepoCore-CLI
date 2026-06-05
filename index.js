#!/usr/bin/env node

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

// COMMANDS

const { initRepo } = require("./commands/init");
const { addRepo } = require("./commands/add");
const { commitRepo } = require("./commands/commit");
const { pushRepo } = require("./commands/push");
const { pullRepo } = require("./commands/pull");
const { addRemote } = require("./commands/remote");
const { cliLogin } = require("./commands/cliAuth");
const { showRemote } = require("./commands/remoteInfo");
const { cloneRepo } = require("./commands/clone");
const { showStatus } = require("./commands/status");
const { showGuide } = require("./commands/guide");

// CLI

yargs(hideBin(process.argv))
    .scriptName("repocore")
    .usage("Usage: repocore <command>")

    .command("init", "Initialise a new repository", {}, initRepo)

    .command(
        "add <file>",
        "Add a file to staging",
        yargs => yargs.positional("file", { type: "string" }),
        argv => addRepo(argv.file)
    )

    .command(
        "commit <message>",
        "Commit staged files",
        yargs => yargs.positional("message", { type: "string" }),
        argv => commitRepo(argv.message)
    )

    .command("push", "Push commits", {}, pushRepo)

    .command(
        "pull [commitHash]",
        "Pull latest or specific commit",
        yargs => yargs.positional("commitHash", { type: "string" }),
        argv => pullRepo(argv.commitHash)
    )

    .command(
        "remote <url>",
        "Configure remote repository",
        yargs => yargs.positional("url", { type: "string" }),
        argv => addRemote(argv.url)
    )

    .command(
        "login <email> <password>",
        "Login to RepoCore",
        yargs =>
            yargs
                .positional("email", { type: "string" })
                .positional("password", { type: "string" }),

        argv => cliLogin(argv.email, argv.password)
    )

    .command("remote-info", "Show remote info", {}, showRemote)

    .command(
        "clone <url>",
        "Clone repository",
        yargs => yargs.positional("url", { type: "string" }),
        argv => cloneRepo(argv.url)
    )

    .command("status", "Show repository status", {}, showStatus)

    .command("guide", "Show RepoCore guide", {}, showGuide)

    .demandCommand(1, "Please provide a command")
    .help()
    .argv;