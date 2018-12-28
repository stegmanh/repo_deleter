# Repo Deleter

This project is a simple, interactive Node.js script that will allow you to quickly delete
repositories on Github.

To use this script, you will have to first generate a personal access token in your Github settings.
Ensure that the token has the `repo` and `delete_repo` permissions.

This script isn't featureful, but does aim to make sure that the user is made aware of action being
taken. If you have any issues running the script or encounter a bug, please open an issue.

# Installation

`git clone https://github.com/stegman/repo_deleter`
`npm install`

# Usage
`RD_TOKEN=[TOKEN] node index.js`
