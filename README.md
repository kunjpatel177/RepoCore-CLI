# RepoCore CLI

A Git-inspired Version Control CLI for the RepoCore Cloud Repository Platform.

RepoCore CLI enables developers to manage repositories directly from the terminal, including repository initialization, staging files, creating commits, connecting remotes, pushing code to the cloud, pulling updates, and cloning repositories.

---

## Features

- Initialize repositories locally
- Stage files for commits
- Create commit snapshots
- Push commits to RepoCore Cloud
- Pull repository updates
- Clone repositories
- Configure remote repositories
- Repository status tracking
- Global authentication

---

# Installation

Install globally using npm:

```bash
npm install -g repocore-cli
```

Verify installation:

```bash
repocore --help
```

---

# Login

Authenticate your RepoCore account:

```bash
repocore login your_email your_password
```

Example:

```bash
repocore login kunj@example.com MyPassword123
```

Authentication is stored securely and reused across all repositories.

---

# Quick Start

## 1. Initialize Repository

```bash
repocore init
```

---

## 2. Add Files

Add a file:

```bash
repocore add file_name
```

Add a folder:

```bash
repocore add folder_name
```

Add all files:

```bash
repocore add .
```

---

## 3. Commit Changes

```bash
repocore commit "Initial commit"
```

Example:

```bash
repocore commit "Added authentication system"
```

---

## 4. Connect Remote Repository

```bash
repocore remote repocore://username/repository
```

Example:

```bash
repocore remote repocore://kunj/myproject
```

---

## 5. Push Repository

```bash
repocore push
```

Uploads all unpushed commits to RepoCore Cloud.

---

## 6. Pull Changes

Pull latest commit:

```bash
repocore pull
```

Pull specific commit:

```bash
repocore pull <commitHash>
```

Example:

```bash
repocore pull a01f5f33
```

---

## 7. Clone Repository

```bash
repocore clone repocore://username/repository
```

Example:

```bash
repocore clone repocore://kunj/sample-project
```

---

# Commands

| Command | Description |
|----------|------------|
| `repocore init` | Initialize a repository |
| `repocore add <file>` | Stage a file |
| `repocore add <folder>` | Stage a folder |
| `repocore add .` | Stage all files |
| `repocore commit "<message>"` | Create a commit |
| `repocore push` | Push commits to cloud |
| `repocore pull` | Pull latest changes |
| `repocore pull <commithash>` | Pull specific commit |
| `repocore clone <url>` | Clone repository |
| `repocore remote <url>` | Configure remote |
| `repocore remote-info` | Show remote details |
| `repocore status` | Show repository status |
| `repocore login <email> <password>` | Login to RepoCore |
| `repocore guide` | Show workflow guide |
| `repocore --help` | Show help menu |

---

# Repository URL Format

RepoCore uses custom repository URLs:

```text
repocore://username/repository
```

Example:

```text
repocore://kunj/backend-api
```

---

# Typical Workflow

```bash
repocore login email password

repocore init

repocore add .

repocore commit "Initial commit"

repocore remote repocore://username/repository

repocore push
```

---

# Cloud Integration

RepoCore CLI communicates with:

- RepoCore Backend APIs
- MongoDB Atlas
- AWS S3 Storage

All repository files are securely stored in cloud infrastructure while preserving local workflow.

---

# Security

RepoCore CLI includes:

- JWT Authentication
- Repository Ownership Validation
- Protected Private Repositories
- Secure API Communication

---

# Troubleshooting

### Login Failed

Verify credentials:

```bash
repocore login email password
```

---

### Push Access Denied

Ensure:

- You are logged in as repository owner
- Remote repository is configured correctly

Check:

```bash
repocore remote-info
```

---

### Repository Not Initialized

Run:

```bash
repocore init
```

before using repository commands.

---

### Remote Not Configured

Configure remote:

```bash
repocore remote repocore://username/repository
```

---

# Documentation

Full web documentation is available on the RepoCore platform.

Website Link: https://repocore-p0nu.onrender.com/

---

# Author

**Kunj Patel**

GitHub: https://github.com/kunjpatel177