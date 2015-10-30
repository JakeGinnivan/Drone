# drone

## Goals
My goals functionally for drone are:

 - Authenticate via github
 - choose interested repos
 - view aggregated open issue/pull request list
 - be able to filter labels, sort by date opened, last activity etc
 - be able to push issues into a queue

Once that MVP is done will look what is next, including automatically performing some tasks and trying to add some smarts to drone to reduce workload on OSS maintainers who have multiple projects.

### Stretch goals
Ideally when you (or another maintainer) posts a comment in an issue, it gets removed from the queue as it has been actioned. When a non-maintainer posts a comment or additional commits are pushed to a PR it should go back on the queue.

### Learning goals
Other goal is to use it as an opportunity to have a decent OSS isomorphic react sample where I can get feedback/ideas from others on a real codebase.

Pull requests with suggestions and next steps **really** welcome..

## Setup
There are a few things you need to run this, first you need to register a github application then copy `user_constants.template.js` and rename to `user_constants.js`. Then fill in the CLIENT_ID and CLIENT_SECRET.
You will also need a Azure table storage account, put the account and access key in that file as well.

Also to receive the GitHub webhook callbacks for local testing you need to install ngrok. 
