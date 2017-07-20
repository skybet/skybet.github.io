---
layout:     post
title:      Delivery Pipelines with Test Kitchen, Chef and Docker
author:     gav_harris
date:       2016-03-01 12:00:00
summary:    Jenkins, Test Kitchen, Chef and Docker put together are much more than just a configuration management platform
category:   Deployment
tags:       open source, chef, ruby, jenkins, docker
---

We have been using Chef for configuration management at SB&G for a good while now, making heavy use of Test Kitchen for testing our cookbooks with Jenkins, Docker containers and ServerSpec.

These cookbooks also serve as local development environments. By distributing Vagrant box images containing all the necessary tools for Chef development to our teams, it is usually the case that simply cloning a cookbook in the Workstation VM and running Test Kitchen is enough to get a development version of an application running, in Docker containers, locally. Test Kitchen configures ports forwarded to the application, allowing developers to access locally hosted services from their desktop.

It is a nice workflow, it means a high level of confidence that changes deployed in integration environments are the same changes that get released to production environments and that they work in the same way. Because developers are free to experiment locally, innovation is easier. Problems are caught earlier in the development process - saving time further down the line, and is increasingly common practice with configuration management tools like Chef and Puppet.

Jenkins, Test Kitchen, Chef and Docker put together are much more than just a configuration management platform, though.

Starting to think about how to increase our speed of delivery as we grew, we realised that small is good. Small teams, providing microservice-like services to each other with established APIs and SLAs. These teams need to be independent, with as little dependency on other teams as possible. These teams need to be small which means they don’t want to have to manage complex build, test and development environments, but they do want to be able to have complex CI pipelines for all kinds of software, from PHP to Node.js or Java. How can Chef help?

Chef recipes don’t just have to be used to write system configuration or install packages. With Test Kitchen and Docker, we can use Chef DSL to perform and test any action inside the container. Replacing CI integration bash scripts usually run by Jenkins with Chef DSL run by Test Kitchen makes these scripts testable and version controlled in the same way as Chef cookbooks. Developers and operations are using the same SDK to orchestrate their workflows, meaning greater collaboration.

This means that we can write Test Kitchen suites that do things such as check out git repositories, execute Mocha tests, run ESLint for Node.js, or install a compiler and build a binary, or do something with Maven. Endless possibilities!

This is good for a few reasons. First, your CI pipeline itself is now testable and version controlled code. Second, that CI pipeline is running inside a Docker container using the same software versions as will deploy onto the production platform, since they’re using the same Chef recipes. This means that your tests are representative, and you don’t have problems for example where one team needs Java 1.7 on the CI slave but another team needs Java 1.8, it is all in containers so everyone can get along. Third, developers and operations are now talking the same language.

Testing of the application and the infrastructure code is part of the same delivery pipeline. At all stages of the development workflow, platform and applications are tested together, even on the developers local machine.

The final piece of the puzzle is Jenkins Pipeline. This is a plugin for Jenkins maintained by CloudBees that allows you to configure your jobs as a Groovy-based DSL. The plugin allows job definitions to be stored and run directly from source control, which means the Jenkins pipeline can also be stored in the same git repository as the application and infrastructure code. We create ‘stub’ Jenkins jobs for each of our services, and these jobs run Pipeline DSL from the git repository maintained by the service owning team.

That makes it very easy for a team to make changes to their CI workflows, while being able to make use of a centrally maintained Jenkins instance that has deep integration with Chef and other orchestration flows. Complex flows can be built that define the entire software delivery pipeline, with a very small cost of starting up a new project.

An example might help at this point, so lets look at some code for an example Chef Integration. This example is a single git repository, containing both the application code (a Node.js application) and the infrastructure code. It also contains the CI pipeline as a Jenkins Pipeline definition. The Node.js application requires a connection to one of our MySQL databases in order to function. The layout of the repository:

```
event-service/
│   .kitchen.yml                <- Test Kitchen configuration. Container setup, Chef run lists
│   Berksfile                   <- Berkshelf for Chef cookbook version management, pulling in common functionality
│   workflow.groovy             <- Jenkins Pipeline job definition
├───event-service/              <- Node.js application
├───dockerfiles/                <- Dockerfiles for creating basic containers from images
└───chef/
    ├───cookbooks/
    │   ├───event-service/
    │   │   ├───recipes/
    │   │   │   lint.rb         <- CI Lint stage definition
    │   │   │   test.rb         <- CI Test stage definition
    │   │   │   build.rb        <- CI Build stage definition
    │   │   │   vendor.rb       <- CI Vendor stage definition
    │   │   │   deploy.rb       <- Application release recipe
```

First, the Test Kitchen configuration. Kitchen uses YAML for configuration, and supports Ruby ERB fragments in-line. This is useful because it allows us to pass environment variables via Test Kitchen through to Chef recipes.

The driver configuration comes first, of which there are many. Docker provides the features we need. Chef Zero is the provisioner, which will be used to configure the container after it has been created by the dockerfile.


```yaml
---
driver:
  name: docker
provisioner:
  name: chef_zero
  cookbooks_path: ./chef/cookbooks
  client_rb:
    environment: DEV
platforms:
  - name: centos7
    driver_config:
      dockerfile: ./dockerfiles/centos7
      volume: <%=ENV['PWD']%>:/tmp/workspace # Make the working directory available inside the container
    attributes:
      ci_build: <%=ENV["CI"]%>
      workspace: /tmp/workspace
```

Important to note here is the volume mount. When run in CI, this means that the docker container, and therefore Chef, have access to the Jenkins workspace. This makes it simple to write Chef recipes that output to the Jenkins workspace from inside a docker container. This can be used to write test results or to create build artefacts for later analysis by Jenkins or use in later Pipeline stages.

Next, the suites are defined. Each suite is a container with its own Chef run list, and containers can be linked together. Here we create a fixtured MySQL server which is linked to our Node.js application container:

```yaml
suites:
  - name: db-server # Fixtured MySQL container
    run_list:
      - recipe[sbg_mysql::install]
      - recipe[sbg_event-service::db]
      - recipe[sbg_event-service::db-fixtures]
    driver:
      instance_name: db-server
      publish: 3306
  - name: app-server  # Application test and build container, linked to fixtured DB
    run_list:
      - recipe[sbg_event-service::lint]
      - recipe[sbg_event-service::test]
      - recipe[sbg_event-service::build]
      - recipe[sbg_event-service::vendor]
    driver:
      instance_name: app-server
      forward:
        - 1700:1700
      links: "db-server:db-server"
    attributes:
      sbg_event-service:
        db-host: db-server
```

With this configuration, running ```kitchen converge``` from the root of the repository will launch two docker containers with port 1700 forwarded to the running application, that has been built from source.

The Chef recipes themselves are fairly simple.

```lint.rb``` Installs the ```eslint``` utility and runs it, outputting the result to the shared volume

```ruby
#run eslint inside the container, output the results to the shared volume mount
execute "Install eslint" do
  command "/opt/node/bin/npm i -g eslint"
  creates "/opt/node/bin/eslint"
  action :run
  not_if {File.exists?("/opt/node/bin/eslint")}
end

execute "event-service eslint report" do
  command "eslint --ext .js,.jsx -f checkstyle . | /usr/bin/tee #{node['workspace']}/build/lint-eslint.xml"
  cwd "#{node['workspace']}/event-service"
  action :run
end
```

```test.rb``` Runs ```npm test``` and outputs the test result to the shared volume

```ruby
#run npm test and copy the resulting Mocha test report to the Jenkins workspace for analysis by Pipeline
execute "run npm test" do
  command "npm install && npm run test"
  cwd "#{node['workspace']}/event-service"
  action :run
end

execute "Copy Mocha test report to workspace" do
  command "cp build/test-mocha.xml #{node['sbg_event-service']['workspace']}/build/test-mocha.xml"
  cwd node['workspace']
  user "root"
  group "root"
  action :run
end
```

```build.rb``` Runs ```npm install``` and installs the production dependencies

```ruby
#prune the installation and install npm production dependencies
execute "run npm install" do
  command "npm prune && npm install --production"
  cwd "#{node['workspace']}/event-service"
  action :run
end
```

```vendor.rb``` Creates a deployable artefact of the node application in the shared volume mount

```ruby
#Create a .tbz2 containing the node application and all its production dependencies
execute "build artefact" do
  command "/bin/tar -cvjf #{node['workspace']}/build/event-service-v#{node['new_tag_version']}.tbz2 event-service/"
  cwd node['workspace']
  action :run
end
```

A fairly simple set of steps to build an application. Test results, when run by Jenkins, are output into the Jenkins workspace for later analysis. What ties this together is Jenkins Pipeline. The ```workflow.groovy``` for this example is described below. This DSL is run by Jenkins when a new tagged version of the event-service is needed:

```groovy
def rubyPath     = '/opt/chefdk/embedded/bin/ruby --external-encoding=UTF-8 --internal-encoding=UTF-8 '

def env = "event-service"
repo = "ssh://git@git-server/${env}.git"


def notifySlack(text, channel) {
    def slackURL = 'https://hooks.slack.com/services/XXXXXX/XXXXXXXX'
    def payload = JsonOutput.toJson([text      : text,
                                     channel   : channel,
                                     username  : "Jenkins",
                                     icon_emoji: ":jenkins:"])
    sh "curl -X POST --data-urlencode \'payload=${payload}\' ${slackURL}"
}

def kitchen = '''#!/bin/bash
foodcritic chef/cookbooks
CI=true kitchen converge
CI=true kitchen verify
'''
```
Some definitions. Slack is used to notify teams of completed builds at the end of the workflow. The Test Kitchen commands run the Kitchen configuration defined above.

```groovy
node("slave-docker") {
    currentBuild.setDisplayName("${env} #${currentBuild.number}")
    branch = "release"
```

Select a Jenkins slave and set the current display name of the build. This is useful for providing developer feedback during a workflow.

```groovy
    stage name: "checkout-${env}", concurrency: 1
    checkout([$class: 'GitSCM', branches: [[name: branch]], doGenerateSubmoduleConfigurations: false, extensions: [[$class: 'CleanBeforeCheckout']], submoduleCfg: [], userRemoteConfigs: [[url: repo]]])
```
The first CI stage. This will check out the event-service git repository to the Jenkins workspace

```groovy
    stage name: "get-new-tag-${env}", concurrency: 1
    sh '''#!/usr/bin/bash
    LASTTAG=`git describe --abbrev=0 --tags`;
    VERSION=${LASTTAG/event-service-v};
    NEWVERSION=$(( VERSION + 1 ));
    NEWTAG="${NEWVERSION}";
    echo -n $NEWTAG > .gitver'''
    def newtag = readFile('.gitver').trim()
    echo "New version will be ${newtag}"
```
This is a utility stage that determines the next tag version for the repository based off the previous tag version. This is a required workaround since Jenkins Pipeline ```sh``` steps currently don't have any return values. There is an issue raised for this.

```groovy
    stage name: "test-kitchen-${env}", concurrency: 1
    wrap([$class: 'AnsiColorSimpleBuildWrapper', colorMapName: "xterm"]) {
        sh kitchen
    }
```
The main stage. Runs Test Kitchen, which builds and verifies the application in docker containers using Chef. The Chef recipes output test results and a build artefact to the Jenkins workspace.

```groovy
    stage name: "warnings-${env}", concurrency: 1
    step([$class: 'WarningsPublisher', canComputeNew: false, canResolveRelativePaths: false, consoleParsers: [[parserName: 'Foodcritic']], defaultEncoding: '', excludePattern: '', healthy: '', includePattern: '', parserConfigurations: [[parserName: 'JSLint', pattern: 'build/lint-*.xml']], unHealthy: ''])
```
The lint output is parsed by Jenkins, JSLint for the Node.js and Foodcritic for the Chef recipes.

```groovy
    stage name: "junit-${env}", concurrency: 1
    step([$class: 'JUnitResultArchiver', keepLongStdio: true, testResults: 'build/test-*.xml'])
```
The test output from ```npm test``` is analysed by Jenkins. Failed tests here results in a failed build

```groovy
    stage name: "archive-${env}", concurrency: 1
    step([$class: 'ArtifactArchiver', artifacts: 'build/*.tbz2', excludes: ''])
```
This stage tells Jenkins to archive the artefact produced by the ```vendor.rb``` Chef recipe

```groovy
    stage name: "push-tag-${env}", concurrency: 1
    sh "git tag -a event-service-v${newtag} -m \"event-service-v${newtag} pushed by Jenkins\""
    sh "git push --tags"

    currentBuild.setDisplayName("event-service-v${newtag}")

    notifySlack("Build ${currentBuild.number} completed, tagged with event-service-v${newtag}","#event-service")
}
```
Finally, push a new tagged version of the application + infrastructure code, set the build name to that version and notify our teams Slack channel that a new build has been successfully completed.

Further Jenkins jobs can then be used to push that tag to integration and production environments.


