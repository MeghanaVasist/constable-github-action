import { request } from "@octokit/request";


const time = (timestamp1, timestamp2) => {
  let difference = Date.parse(timestamp1) - Date.parse(timestamp2);
  let daysDifference = Math.ceil(difference / 1000 / 60 / 60 / 24);
  return daysDifference;
}

const calculateGrade = (score) => {
  let grade = 'F';
  if (score >= 95) {
    grade = 'A+';
  }
  if (score >= 90 && score <= 94) {
    grade = 'A';
  }
  if (score >= 85 && score <= 89) {
    grade = 'B+';
  }
  if (score >= 80 && score <= 84) {
    grade = 'B';
  }
  if (score >= 75 && score <= 79) {
    grade = 'C+';
  }
  if (score >= 70 && score <= 74) {
    grade = 'C';
  }
  if (score >= 65 && score <= 69) {
    grade = 'D+';
  }
  if (score >= 60 && score <= 64) {
    grade = 'D';
  }
  return grade;
}

const getRepositoryDetails = async (owner, repository) => {
  let score = 0;
  let gradeData = {};
  let gradeDataList = [];
  let mergePullRequestCount = 0;

  const repo_data = await request('GET /repos/{owner}/{repo}', {
    owner: owner,
    repo: repository
  });
  const watchers = repo_data.data["watchers"]
  const openIssueCounts = repo_data.data["open_issues"]

  const repoMetaData = {
    name: repo_data.data['full_name'],
    url: repo_data['git_url']
  };

  const add_del = await request('GET /repos/:owner/:repo/stats/code_frequency', {
    owner: owner,
    repo: repository
  });

  const additionDeletionData = add_del.data;

  const contributors = await request('GET /repos/:owner/:repo/stats/contributors', {
    owner: owner,
    repo: repository
  });

  const pull_req = await request('GET /repos/:owner/:repo/pulls', {
    owner: owner,
    repo: repository
  });

  const pull_closed = await request('GET /repos/:owner/:repo/pulls?state=closed', {
    owner: owner,
    repo: repository
  });

  const closed_issue = await request('GET /repos/:owner/:repo/issues?state=closed', {
    owner: owner,
    repo: repository
  });

  // const open_issue = await request('GET /repos/:owner/:repo/issues', {
  //   owner: owner,
  //   repo: repository
  // });

  let averageIssue = 0
  closed_issue.data.forEach(element => {
    averageIssue += time(element.closed_at, element.created_at)
  });

  averageIssue = averageIssue / closed_issue.data.length

  const result = await request('GET /repos/{owner}/{repo}/contents', {
    owner: owner,
    repo: repository
  })

  const files = new Set();
  const reqFiles = ['README.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'LICENSE', 'CITATION.md', '.gitignore']
  const reqTempFiles = ['README', 'CONTRIBUTING', 'CODE_OF_CONDUCT', 'LICENSE', 'CITATION', 'GITIGNORE']
  const fileWeights = [2, 1, 0.5, 1, 0.5, 1]

  for (let i = 0; i < result.data.length; i++) {
    files.add(result.data[i].name)
  }

  reqFiles.forEach(file => {
    const loc = reqFiles.indexOf(file)
    gradeData[file] = { name: file, weight: fileWeights[loc], score: 0 }
  });

  files.forEach(file => {
    var check = file.toUpperCase()
    reqTempFiles.forEach(template => {
      const loc = reqTempFiles.indexOf(template)
      if (check.includes(template)) {
        gradeData[reqFiles[loc]]['score'] = fileWeights[loc]
      }
    })
  });

  var PR = 0
  pull_closed.data.forEach(pullRequest => {
    if (pullRequest.merged_at) {
      PR += time(pullRequest.merged_at, pullRequest.created_at)
      mergePullRequestCount += 1
    }
  });
  PR = PR / pull_closed.data.length

  gradeData = { ...gradeData, "Average PR Closing Time": { name: "Average PR Closing Time", weight: 2, score: (Math.round(PR) < 10 && Math.round(PR) > 0) ? 2 : 0 } }
  gradeData = { ...gradeData, "Average Issue Closing time": { name: "Average Issue Closing time", weight: 2, score: (averageIssue < 10 && averageIssue > 0) ? 2 : 0 } }

  Object.keys(gradeData).forEach((key) => {
    score += gradeData[key]['score'];
    gradeDataList.push(gradeData[key])
  })

  const gradedScore = calculateGrade(score * 10);
  var totalPullRequestCount = pull_req.data.length + mergePullRequestCount;
  totalPullRequestCount = (totalPullRequestCount === 0) ? 30 : totalPullRequestCount
  const openPRCount = (pull_req.data.length / totalPullRequestCount) * 100;
  const mergePRCount = (mergePullRequestCount / totalPullRequestCount) * 100;

  var totalIssueCount = closed_issue.data.length + openIssueCounts - pull_req.data.length - pull_closed.data.length;
  let issueCount = totalIssueCount;
  const closedIssueCount = closed_issue.data.length === 30 ? 50 : closed_issue.data.length

  totalIssueCount = (totalIssueCount === 0) ? 30 : totalIssueCount

  const commit_activity = await request('GET /repos/:owner/:repo/stats/commit_activity', {
    owner: owner,
    repo: repository
  });
  const commitActivityData = commit_activity.data;

  return {
    repoMetaData, gradeDataList, gradedScore, commitActivityData, additionDeletionData, cardData: {
      starCount: repo_data.data["stargazers_count"],
      forkCount: repo_data.data["forks"],
      contributorCount: contributors.data.length,
      watcherCount: watchers
    }, pulseData: {
      openPRCount: openPRCount,
      mergedPRCount: mergePRCount,
      totalPRCount: totalPullRequestCount,
      closedIssueCount: closedIssueCount,
      openIssueCount: Math.min(50, openIssueCounts),
      totalIssueCount: issueCount,
      totalIssueCountPercentage: Math.min(100, issueCount)
    },
  };

}

export { getRepositoryDetails, calculateGrade };