const octokit = require('@octokit/rest')()
const { Confirm, MultiSelect } = require('enquirer');

const USAGE = `RD_TOKEN=[TOKEN] node index.js`
const GH_PROMPT_NAME = 'Select Repos'
const GH_PROMPT_MSG = 'Which repos would you like to delete?'
const GH_CONFIRM_NAME = (name) => `Delete ${name}?`


const TOKEN = process.env.RD_TOKEN
if (!TOKEN) {
  console.log('missing github token')
  console.log(`usage: ${USAGE}`)
  process.exit(1)
}

octokit.authenticate({
  type: 'token',
  token: TOKEN
})


// Attempts to execute function or exits with error and msg on failure
async function tryOrExit(fn, msg) {
  try {
    return await fn()
  } catch (exception) {
    console.log(msg)
    exception ? console.log(exception) : ""
    process.exit(1)
  }
}

// Iternates over an array of repoNames in format (OWNER/NAME)
// and deletes the repo after confirming
async function deleteRepos(repoNames) {
  for (let i = 0; i < repoNames.length; i++) {
    const repoName = repoNames[i]

    const [owner, repo] = repoName.split('/')
    if (!owner || !repo) {
      throw new Error(`${repoName} is missing either owner or repo`)
    }

    const confirmPrompt = new Confirm({
      name: GH_CONFIRM_NAME(repoName),
    });

    const shouldDelete = await tryOrExit(confirmPrompt.run.bind(confirmPrompt), 'failed to confirm selection to delete repo')
    if (shouldDelete !== true) {
      console.log(`not deleteing ${repoName}\n`)
      console.log()
      continue
    }

    console.log(`deleting ${repoName}...`)
    await tryOrExit(octokit.repos.delete.bind(octokit, {owner: owner, repo: repo}), `failed to delete repository ${repoName}`)
    console.log(`deleted ${repoName}!`)
    console.log()
  }
}

// Accepts a list of GH repo objects and returns a promp with the values being the repo full names
function makeRepoListPrompt(repos) {
  const reposAsChoices = repos.map(repo => { return {'name': repo.full_name }})
  const prompt = new MultiSelect({
    name: GH_PROMPT_NAME,
    message: GH_PROMPT_MSG,
    choices: reposAsChoices
  });
  return prompt
}

async function main() {
  const {headers, status, data} = await tryOrExit(octokit.repos.list.bind(octokit, {affiliation: 'owner', sort: 'created', per_page: 5, direction: 'asc'}), 'failed to fetch repos')

  const prompt = makeRepoListPrompt(data)

  const answers = await tryOrExit(prompt.run.bind(prompt), 'failed to get answers from prompt')

  deleteRepos(answers)
}

main()
