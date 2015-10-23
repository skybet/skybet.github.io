---
layout:     post
title:      Using Zookeeper Locks in Jruby
date:       2015-10-21 13:00
summary:    How to use Zookeeper locks in Jruby
category:   Jruby
tags:       ruby, hadoop, zookeeper
author:     alice_kaerast
---

For a while we've been using an in-house CLI tool based on the [Pidl orchestration framework](/2015/09/09/opensourcing-pidl/) to run our ETL pipelines in Hadoop.  With a small number of pipelines running at any one point, we could run this on a single server within the cluster, but with a growing number of pipelines and the limited resiliency a single server gives we had to make a few changes.

The original code used a text file in the /tmp directory on the local file system.  It was simple to use, simple to debug, and easy to remove stale locks.  But it didn't work across multiple servers.  We considered using an NFS share for the locks, but given we already need a zookeeper cluster running for our existing services it made sense to use that. 

```rb
    def self.lock name, &block
      fn = "/tmp/#{name}.tmp"
      File.open(fn, File::RDWR | File::CREAT) do |f|
        if not f.flock(File::LOCK_EX | File::LOCK_NB)
          raise RuntimeError.new "Cannot acquire lock"
        end

        begin
          yield
        ensure
          File.unlink(fn)
        end
      end
    end
```

Any time a pipeline needed to be run, it would be wrapped around a `lock pipeline.name do` block.  Simples.

There's a really nice [zk ruby gem](https://github.com/zk-ruby/zk) for high-level interactions with Zookeeper but unfortunately it doesn't work with Jruby out of the box, which is a problem because we use Jruby to interact with Hive and HBase Java APIs rather heavily.  So after a period of head scratching, we realised the zookeeper gem does have code to support Jruby but it needs building using JRuby.

```
git checkout https://github.com/zk-ruby/zookeeper.git
cd zookeeper
gem build zookeeper.gemspec
```

With the zookeeper gem built and uploaded to our internal gemserver, the actual code to use locking in Zookeeper with the zk gem is actually fairly simple.

First we need to find out where the zookeeper servers are.  Thankfully we've already got an ini file with this information in it, as we need to know for interacting with HBase.

```rb
require 'inifile'
maximus_config = IniFile.load('/etc/maximus.cfg')
zookeeper_servers = maximus_config['hbase']['zookeeper.quorom'] + '/maximus'
```

The ini file it loads contains something like the following:

```
[hbase]
zookeeper.quorum=zk01:2181,zk02:2181,zk03:2181
```

Once we know where the zookeeper servers are and have added a chroot to not affect other systems, we can connect to them

```rb
zk = ZK.new(zookeeper_servers)
```

And then we can create a lock and yield to the code we need to run


```rb
begin
  if pipeline_lock.lock!
    yield
  else
    raise "Failed to get the lock! #{name}"
  end
ensure
  pipeline_lock.unlock! # We also drop the lock on disconnection to Zookeeper, so this isn't strictly necessary
end
```

With the final function as follows


```rb

    def self.lock name, &block
      require 'zk'
      require 'inifile'
      maximus_config = IniFile.load('/etc/maximus.cfg')
      zookeeper_servers = maximus_config['hbase']['zookeeper.quorum'] + '/maximus'
      zk = ZK.new(zookeeper_servers)
      pipeline_lock = zk.locker(name)
      begin
        if pipeline_lock.lock!
          yield
        else
          raise "Oh noes, we didn't get teh lock! #{name}"
        end
      ensure
        pipeline_lock.unlock! # We also drop the lock on disconnection to Zookeeper, so this isn't strictly necessary
      end
    end
```

OK, but how do we debug this?  How do we see locks and delete them?  Whilst it's not as simple as deleting a file in /tmp, it's also not as easy to accidentally delete a lock.  You have to explicitly go looking for them.  And the code to do this is very simple.
    
```rb
require 'zk'
zk = ZK.new('localhost:2181/maximus')
zk.find('/_zklocking') {|lock| puts lock }
zk.delete('/_zklocking/Alice/ex0000000000')
zk.delete('/_zklocking/Alice/')
```
    
This does introduce a change of behaviour which may not be immediately obvious.  Where the original code will leave the lock file in place if the pipeline fails, the new code drops the lock as soon as it ends - regardless of success or failure.  Quite often the fix to failed pipelines has been to manually remove the locks and just rerun the pipeline, so this is actually desired behaviour most of the time.    
    
We can now run our pipelines on any number of servers, and the locks will be available to them all.  It enables us to schedule the running of pipelines using multiple Jenkins slaves, but that's a topic for another day.    
