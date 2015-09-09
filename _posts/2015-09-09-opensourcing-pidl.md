---
layout:     post
title:      Open-Sourcing Pidl (Pipeline Definition Language)
permalink:  open-sourcing-pidl
date:       2015-09-09 13:13:00
summary:    Announcing the release of Pidl, a Ruby DSL that we developed to manage our ETL pipelines through Hadoop. 
---

_Today we released [Pidl (Pipeline Definition Language)](https://github.com/skybet/pidl) as an open MIT licenced project to our Github account. We developed this Ruby DSL to manage our ETL pipelines through our Hadoop cluster. This article discusses what it is, and why we felt the need to develop it._

Right back in the days of Hadoop 1 and going forward into the world of Hadoop 2, Spark and the like, the task of orchestrating tasks has been critical. Your data processing job might make the absolute most of your cluster, but if the data hasn't been put in the right place in the first place, it's all for nought.

A single job may involve using Sqoop or HDFS to put data in place, the executing of Hive or MapReduce jobs to manipulate and move data, keeping track of what has been done and writing log files to ensure everything is monitorable. There are many potential solutions to this problem, and this post will introduce one of those in use in Sky Betting And Gaming for ETL pipelines.

Like many old data warehouses, shell scripting has been the norm for orchestrating scripts, queries, imports and exports. There are many problems with shell scripts, not least that you don't necessarily know something is wrong until most of the job is already done and a syntax error catches you out. Parallelism is difficult, and getting to grips with even bash's relatively simple control flow syntax is enough to give you a headache.

The primary method of orchestrated workflows for Hadoop within SkyBet is by running pipelines of commands that manipulate data in a variety of ways. Pidl is a Pipeline Definition Language intended to make describing these
pipelines concise and consistent while being flexible enough to handle any
behavioural requirement.

Pidl itself is a domain specific language that runs on a Ruby interpreter. This means that raw Ruby code can be used to assist in the creation of more complex pipelines alongside Pidl syntax. More specifically the version of Pidl used for Hadoop orchestration runs on JRuby, a version of the Ruby language that runs on a JVM. This means that incorporating Hadoop libraries and using JVM native clients is possible within the same codebase.

As well as pipeline description syntax, Pidl provides a useful command line runner that allows pipelines described by Pidl scripts to be examined, executed and monitored.

### Anatomy Of A Pipeline

Pidl provides a number of primitive parts that are used to build an executable structure that performs the work of the pipeline. These are:

* **pipeline** The pipeline being described.
* **tasks** A unit of functionality within a pipeline.
* **actions** The functional parts of a task that actually perform useful work.

In simple terms, a pipeline is made up of a number of discrete tasks, and each task runs a number of discrete actions. There are a number of predefined types of action that use a combination of native Ruby functionality, Hadoop client libraries, and shelling out to 3rd party executable as the tool requires. These include:

* **file**  local file operations
* **hdfs**  HDFS file operations
* **hive**  run Hive scripts or queries
* **hbase**  manipulate Hbase rows and tables
* **sqoop**  run Sqoop import scripts
* **sqlplus**  run SqlPlus scripts
* **export**  create and manage Maximus export directories
* **exec**  execute arbitrary Ruby code in pipeline context
* **metric**  export a metric about the running pipeline

Pipelines built with Pidl are subtly different to pipelines built in bash. Bash scripts execute from top to bottom, executing steps as they go, in an imperative manner. Pidl pipelines, on the other hand, parse the script file into an in-memory structure consisting of a pipeline, its tasks and their actions that can be inspected, queried and, ultimately, executed.

This subtle shift in focus, from imperative to declarative coding and describing behaviour rather than giving sequential instruction opens the door to extensive inspection, test and control abilities.

### An example

```ruby
pipeline "data.getter" do

  task :setup do
    hbase "pipeline.ids" do
      action :get
      row "data.getter"
      field :next_date, "data:NEXT_DATE"
    end
  end

  task :stage_data do
    after :setup
    hdfs schema("hdfs.table.staging.sample") do
      action :delete
      flags :recursive
    end

    sqoop "sql/import_sample.ifx.sql" do
      action :import
      dest schema("hdfs.table.staging.sample")
      param "date", :next_date
    end
  end

  task :unstage_data do
    after :stage_data
    hive "sql/unstage_sample.hive.sql" do
      action :execute
    end
  end

  task :complete do
    after :unstage_data
    hbase "pipeline.ids" do
      action :put
      row "data.getter"
      param "data:NEXT_DATE" do
        Date.parse(get :next_date) + 1
      end
    end
  end
end
```

Figuring out what the pipeline does is left as an exercise for the reader. However, the important aspects are demonstrated; uniformity, and the breaking down of the job into tasks and actions that are configured through a unified system.

### Configuration and Schema

A common configuration format is used throughout Pidl to configure everything from client code to user preferences to schema constants. The format is a basic INI file but allows overriding at several levels. In addition the concept of a "run mode" (`dev`, `test` or `prod`) means that having different configuration, schema constants or directory names for different use cases or users is easy.

```
environment = ${username}

[hadoop]
conf.dir = "/etc/hadoop/conf"

[hive]
username = hive
password = Pa55w0rd!
host = hadoopmgmt01
port = 10000
```

```
hive.db.transactions = ${environment}_transactions
hive.table.transactions.import = ${hive.db.transactions}.import
```

The use of string interpolation and a hierarchy of override at many levels (pipeline, host, user, run mode, command line and environment variable) means that hosting a multi-tenant cluster running similar jobs is easy. On production runs `username` could be `prod`, while on test or dev machines it could be `test` or the user's actual local username. Similarly, all the hive host and user credentials could be overridden for different environments.

Having this bubble up through the configuration and affect even database names means that having four hive databases called `prod_transactions`, `test_transactions`, `jbloggs_transactions` and `jsmith_transactions` is possible without having to know about it within the pipeline definition itself.

Of course, the command line executable allows the inspection of the parsed configuration and an overview of what a particular pipeline will do without executing it. This gives the developer chance to ensure that everything is just so before committing to an actual run, knowing that everything will happen in the right order, with the right destinations.

### String Substitution

The string interpolation used in the config files also works in files used by the actions. For example, consider a hive action configured as follows:

``` ruby
hive "sql/import_data.sql" do
  action :execute
  param "min_id", 1234
  param "max_id", 9999
end
```

And consider a schema configuration that results in the following constants:

```
hive.table.staging.bet_placed = staging.placed_bets
hive.table.bet.placed  = bet.placed_bets
```

The file `sql/import_data.sql` could be written to make use of the given constants.

``` sql
INSERT INTO ${hive.table.bet.placed}
  SELECT * FROM ${hive.table.staging.bet_placed
  WHERE bet_id >= ${min_id}
  AND bet_id <= ${max_id}
```

Thanks to the inclusion of both a full set of schema constants and the parameters specified in the action, the resulting query that gets run by hive would be:

``` sql
INSERT INTO bet.placed_bets
  SELECT * FROM staging.placed_bets
  WHERE bet_id >= 1234
  AND bet_id <= 9999
```

This string interpolation is also available for every string passed in to the actions.

### Runtime Context

Each pipeline gets a runtime context to store information about itself. Much of the context is populated automatically by the Pidl executor itself, but it is also useful for storing temporary values for use later in a
pipeline. For example:

``` ruby
pipeline "data.getter" do

  task :setup do
    hbase "pipeline.ids" do
      action :get
      row "data.getter"
      field :name, "user:NAME"
    end
  end

  task :complete do
    after :set
    hbase "pipeline.ids" do
      action :put
      row "data.getter"
      param "user:NAME" do
        get(:name).capitalize
      end
    end
  end
end
```

This pipeline simply retrieves a value of Hbase, then puts it back after capitalising it. It does demonstrate, though, the use of the context. At runtime the value of the user:NAME column is put into a key/value store with a key of :name. Later on, that key is retrieved (via the `get` method) and the value is modified before being returned.

This use of a runtime context independent of variables within the Ruby script defining the pipeline mean that greater control can be maintained. All accesses to the context are wrapped in a mutex to ensure parallel accessors on different threads cannot cause problems, and values that we don't know at time of writing (e.g. the value of :name) can still be referred to within the pipeline.

### Column Maps

The schema constants are useful for getting the name and location of tables and directories, but are not so useful for determining which columns to use for a given query. This is where column maps come in; a simple CSV format that allows a single column to be mapped from its origin (e.g. the OLTP data source) to its destination (e.g. an Oracle database) and every stage between.

```
hive         | hive type | oracle       | oracle type   | desc
-------------+-----------+--------------+---------------+---------------------------------
user_id      | bigint    | user_id      | NUMBER        | System assigned user ID
username     | timestamp | username     | VARCHAR2(64)  | Up to 64 char username
balance_gbp  | string    | balance      | NUMBER        | Current balance (denormalised)
signup_date  | timestamp | signupdt     | DATE          | Date of initial signup
confirm_date | timestamp | confirmdt    | DATE          | Date of eligibility confirmation
```

The column maps can be used for schema creation, for generating a data dictionary or within queries. There are various operations the can be performed on the column maps within pipeline code, including finding a list
of all columns in one table that have a corresponding column in another. Useful for ensuring source and destination match when using INSERT INTO ... SELECT operations.

### Additional Niceties and Future Plans

There are a few other niceties that have been built around the Pidl framework, including a test harness (Tidl) and a Rake-based task runner that can be hooked into any CI platform with ease. Using the task runner the setup, test and execution of pipelines is unified, e.g.:

```
$ RUNMODE=test rake transactions:test
$ RUNMODE=prod rake transactions:setup
$ RUNMODE=prod rake transactions:import
```

The Tidl test harness allows Pidl actions to be used to set up and tear down fixtures, load pipelines into memory and execute all or part of them to ensure they work correctly. It modifies Rspec by including a new
parallel executor that harnesses JRuby's ability to use real threads for parallelism. Multiple tests are run simultaneously by injecting a UUID into the environment configuration, giving each test its own sandbox on the cluster and speeding up long-running tests.

Future plans include the ability to do collection-based processing. At the moment the tasks and actions are geared around set-wise operations on remote data stores. It would be beneficial to work on collections of discrete items such as files on HDFS or the local disk. This would require retrieving and iterating over lists and maps with parallel tasks.

You can find [Pidl source on our Github account](https://github.com/skybet/pidl).
