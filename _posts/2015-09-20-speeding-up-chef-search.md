---
layout:     post
title:      Speeding Up Chef Search
author:     gav_harris
date:       2015-09-20 21:38:37
summary:    We rely on Chef heavily for configuration management. This is one way we speed it up.
category:   Deployment
tags:       open source, chef, ruby, optimisation
---

At Sky Betting & Gaming we make extensive use of Chef searches throughout our recipes. Chef search can be used to find out almost anything about a Chef node, but after writing cookbooks for a few different parts of our stack we found most of the searches were pretty similar. We need to know the hostnames where software is running, their IP addresses, fairly simple information. Most of our searches were queries like "Give me an array of hostnames that run the role y" or "Give me an array of IP addresses that run the role z".

The traditional way to do this is like this:

```ruby
result = search(:node, 'role:common')
```

This executes a Chef search during the compile phase of the Chef run, which involves an API call to the Chef server, dragging back what can be a fairly large JSON node object containing all attributes Chef stores for the node. This gets slow very quickly when you need to search in lots of places in your recipes, both the performance of the Chef server and client suffer, resulting in long converge times on the nodes.

Chef introduced partial search to help with this, which allows you to specify a filter server-side so that you're not throwing huge JSON blobs over the network the whole time. This looks like so:

```ruby
filter = {
            :rows   =>  1000,
            :filter_result   =>  {
              :ipaddress => [ 'ipaddress' ]
            },
        }
result = Chef::Search::Query.new.search( :node, 'role:common', filter );
```

This is better, but still requires a relatively expensive API call to the Chef server, and still involves JSON serialisation and deserialisation still going on for every search we want to do. There isn't really much point in doing this over and over in the various different places we need to use search in, especially since all our searches are so similar.

This is why we use `global_search`. Node JSON objects are loaded and examined during the first search query of the Chef run using partial search, then any attributes we are interested in are cached under `node.run_state` for each node.
Subsequent searches during compile or execution are filled from the `node.run_state` cache, which means there is only one API call into the Chef server for search for each of our Chef runs. Because `node.run_state` is in memory in the chef-client process, it speeds things along nicely.

The same query with `global_search` looks like this:

```ruby
chef-shell> include_recipe "sbg_global_search"
chef-shell> result = get_role_member_hostnames('common')
['host-a','host-b','host-c']
chef-shell>
```

We can also search across Organizations. To do this, you will need to add a client in the target Organization called `searchclient`. The client needn't have any more permission than to read from the API.

To search another Organization:

```ruby
node.default['sbg_global_search']['search']['myorg']['endpoint'] = 'http://yourchefserver/organizations/myorg'
node.default['sbg_global_search']['search']['myorg']]['search_key'] = 'Client key content'
chef-shell> include_recipe "sbg_global_search"
chef-shell> result = get_role_member_hostnames('common', 'myorg')
['host-d','host-e','host-f']
chef-shell>
```

The cookbook is [available on github.com](https://github.com/skybet/global_search)

### Functions

```ruby
get_environment_nodes(env=node.chef_environment.downcase)
```
Returns a hash of node FQDNs and attributes from the node.run_state cache. Optional, return nodes from alternate Organization env

```ruby
get_role_member_hostnames(role, env=node.chef_environment.downcase)
```
Returns an array of node names where node has role on the run_list. Optional, return nodes from alternate Organization env

```ruby
get_role_member_ips(role, env=node.chef_environment.downcase)
```
Returns an array of ipaddresses for each node that has role on the run_list. Optional, return nodes from alternate Organization env

```ruby
get_role_member_fqdns(role, env=node.chef_environment.downcase)
```
Returns an array of fqdns for each node that has role on the run_list. Optional, return nodes from alternate Organization env
