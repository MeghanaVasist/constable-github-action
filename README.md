<div align="center">

  <h1>Constable</h1>

  <h2>Keeping repositories contributable.</h2>
  <h2>Check out the <a href="https://5f9835f7f284f1a827a9681c--jovial-bose-1694a3.netlify.app/" target="_blank">demo</a> of the Constable App!</h2>
  <h2>Now available as a Github Action. Check it out!!!</h2>

  <a href="https://github.com/dangoslen/constable-github-action/actions"><img alt="constable-github-action-status" src="https://github.com/dangoslen/constable-github-action/workflows/units-test/badge.svg"></a>
  <img alt="constable-github-action-coverage" src="./assets/coverage-badge.svg">
  [![DOI](https://zenodo.org/badge/302082206.svg)](https://zenodo.org/badge/latestdoi/302082206)
  <img src="https://img.shields.io/badge/Constable-A+-green" />
  
  [![Watch the video](https://github.com/MeghanaVasist/constable-github-action/blob/main/assets/video_thumbnail.png)](https://youtu.be/kizuzz0sTdM)
  
  <!--[![Constable](http://img.youtube.com/vi/NXANSl0S1xA/0.jpg)](http://www.youtube.com/watch?v=NXANSl0S1xA "Constable")--->
  
</div>

## Testing for Phase 3
For the experimental setup in Phase 3, the tester will be given 5 repositories to test and rank based on the ease of contributability. The tester will be required to manually evaluate the contributability of each repository and rank them based on the tester's order of contributability and record the time taken. Then, they will be given the Constable webapp to evaluate the same 5 repositories and rank the repositories and record the time taken. The time taken and the ease of ranking can be used as the evaluation metrics for evaluating the Constable app. Since the app is deployed on netlify, there is no setup overhead involved which saves time during the lab session.

---

Constable is a web application that grades the contributability of a repository. It provides as a Github badge which developers can add to their repositories and the contributors can use it to get a first glance of the project quality without putting a lot of effort. It displays the entire grade report along with the link for the badge in a Dashboard which can be manually added to the repository. It also provides a simple add action to any GitHub Actions workflow you like and start seeing how contributable your repository is. A sample workflow is provided below:

```yaml
name: "units-test"
on:
  pull_request:

jobs:
  # Constable
  pull-request-workflow:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: constable
      uses: dangoslen/constable-github-action@v0.1
    - name: Comment PR
      uses: thollander/actions-comment-pull-request@master
      with:
        message: "
# ![](https://img.shields.io/badge/Constable-${{ pull-request-workflow.constable.outputs.grade }}-blue)
<details>
  <summary>Click to see the report!</summary>
  ${{ pull-request-workflow.constable.outputs.report }}
</details>"
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

This workflow checks out the repository, grades it with Constable, and supplies the grade and the report to the pull request as a comment. You can combine Constable with whatever workflow you like!

## Sample Dashboard
<img alt="Dashboard" src="https://github.com/MeghanaVasist/constable-github-action/blob/main/assets/Dashboard.JPG"/>

## Contributability Grade

Constable ranks contributability in "letter grades". A+/-, B+/-, C+/-, D+/-, F. For finer granularity, we also provide the raw percentage from 0 - 100 and a report in a `.md` format. The letter grades is determined from the raw percentage using a 10 point scale where the +/- is the top 3 points and bottom 3 points of each 10 point range.

## How is Contributability Calculated?

Constable looks for the presence of files that are associated with making it easy to contribute, as well as signs the repository is active. We currently use the following

* Presence of a `README.md` file
* Presence of a `CONTRIBUTING.md` file
* Presence of a `CODE_OF_CONDUCT.md` file
* Presence of a `License` file
* Presence of a `Citation` file
* Presence of a `.gitignore` file
* Average pull request closing time
* Average issue closing time

### What Makes a Repository Contributable to You?

Do you have an idea of how to grade a repository's contributability? We want you to contribute to this project! Please see our [Contributing](./CONTRIBUTING.md) file to how to contribute to Constable!

## Constable Outputs

A summary of the outputs is listed below. You can also see this in the [Action Definition](./action.yml)

`grade` - a `string` containing the letter grade (A+/-, B+/-, C+/-, D+/-, F) of the repositories contributability.
`score` - an `integer` from 0 - 100 of the
`report` - a `string` containing a report of why the repository recieved the percentage it did. 

## What About the GitHub Community Insights?

We think this effort from GitHub is a great start. However, many more elements of of a repository make it contributable than just a few files being present. The goal of Constable is to be a simple tool that can be used to extend what GitHub has started. Eventually, Constable would hope to be available to other providers like GitLab or BitBucket via a REST API.

## Developing

Before contributing to Constable, please see our [CONTRIBUTING.md](./CONTRIBUTING.md) file. All processes for adding features, reporting bugs, or asking questions can be found there.

Constable uses the [GitHub Action Toolkit](https://github.com/actions/toolkit/blob/master/README.md#packages) for the various packages.

## Package for distribution

Packaging for distribution happens automatically for every pull request or push to `main` or `releases`. If you want to package the source for distribution from your own branch before opening a pull request, you can simply run the following:

```bash
npm run package
```

Since the packaged `index.js` is run from the `./dist` folder.

```bash
git add dist
```

And now GitHub will know to use the action sourced under the `./dist` folder. You could use it in a workflow like 

```yaml
uses: dangoslen/constable-github-action@<your-branch>
```
## Executing Constable App

From the root folder run the following commands:

```bash
cd src/constable-app
npm install
npm start
```
This would run the server and you'll be able to see the UI in your browser. A sample of the UI is shown below:

   <img alt="sample UI" src="./assets/dashboard.png" />
   
Now key in the username and repository name to get the statistics and grade for your repository! Here is the grade report for Zephyr:
<img alt="Dashboard" src="./assets/Dashboard.JPG" />

Before you push the code, run the following command to build the code:
```bash
npm run package
```







