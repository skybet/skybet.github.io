---
layout:     post
title:      Ruby vs chef and the siege of Hashicorp Vault
date:       2018-11-21
summary:    How I discovered the dark secret behind chef and used Ruby to harness the power of Hashicorp Vault
category:   Devops
tags:       Hashicorp,chef,Ruby
author:     andrei_sandu
---
## Hashicorp Vault - the stronghold

It is a company focus to ensure our secrets are secure, and the solution adopted sits with [Hashicorp Vault](https://www.vaultproject.io/).
Great work has been put by the Delivery Engineering team within Sky Betting & Gaming to formalise the process of storing and retrieving
secrets in a seamless way, while maintaining security and ensuring compatibility with Chef and the use cases and business needs of the
company. When dealing with Chef runs, which happen all the time on all of our systems, the main concern is the secrets becoming exposed
by virtue of being loaded on disk. The Delivery Engineering team has put great effort into enforcing that this does not happen
by creating wrapper cookbook resources and libraries to be used by our configuration management. The solution they have implemented for this must restrict loading
secrets to happen at runtime only. The main side effect of this is that it has limited the extent to which one can perform complex logic with Hashicorp Vault
secrets. The first part of this blog post focuses on the different options available to the DevOps engineers when it comes to Hashicorp Vault, the advantages and
disadvantages of the different ways one can interact with Vault, and a personal note on responsibility and freedom when using secure data.

## Restricting access for Chef and the problems it creates

There are many different ways of interacting with secrets in Hashicorp Vault. When it comes to Chef cookbooks, the Sky Betting & Gaming way of doing it is as follows:
 1. `include_recipe 'sbg_vault::chef_auth'` - make sure your recipe includes the wrapper cookbook created to enable our chef runs to access Hashicorp Vault
 2. use the `sbg_vault_secret` resource - this resource was designed to be easy to use for the basic needs of a cookbook and at the same time ensure nobody
 accesses the Vaults at compile time
 3. get `lazy` - the complication arising from the attempt to lock down access for chef-client runs

For example, to read a secret and use it for a resource property or a template:
```ruby
include_recipe 'sbg_vault::chef_auth'

secret = sbg_vault_secret 'path/to/some/secret' do
    kitchen_default dummy: 'key and value pair that kitchen will use'
    action :read
end

file '/path/to/file' do
    content lazy { secret[:key] }
    owner 'root'
    group 'root'
    mode 0700
end

template '/path/to/template/file' do
    source 'source/of/template.erb'
    owner 'root'
    group 'root'
    mode 0700
    variables(
        variable_that_needs_secret: lazy { secret[:key] } # also, when you use that variable you need to do <%= @variable_that_needs_secret.call %>
    )
end
```
`lazy` is necessary because `sbg_vault_secret` does not allow chef to read secrets at compile time. That means that when it loads all the resources, it must
refrain from actually trying to work out what the secret variable is going to be. This implementation is designed to guard against people extracting secrets from
the Vault at compile time and storing them in places where they become accessible to unauthorised entities. The most common example of this would be assigning the
value of a secret to a Chef attribute, which persists on the Chef server in unencrypted form, thus compromising the secret.

The problem with this is, `lazy` is itself a chef-specific thing, meaning you cannot do:
```ruby
include_recipe 'sbg_vault::chef_auth'

secret = sbg_vault_secret 'path/to/some/secret' do
    kitchen_default dummy: 'key and value pair that kitchen will use'
    action :read
end

ruby_variable = lazy { secret[:key] } # no lazy variables

lazy {
    if secret[:key].contains?('nuts')
            puts 'Squirrel!'
    end
} # no lazy logic
# Etc.
```
(There probably is a way to force something like this, but it's well hidden in the depths of internet ruby articles and I could not find it.) If you want to write
any code to process or do logic on `secret[:key]` in the above snippet, there is no apparent way of doing so without encountering the dreaded _Chef failed_  
message.  `sbg_vault_secret` has been written to fail with an error if a read at compile time is attempted. So if you want to do anything more complex with secrets, this just won't cut it!

## Getting around this, and a caveat...

There is a better way! Use the Hashicorp Vault community libraries. This has been documented on the Readme file of `sbg_vault`, as the cookbook required wrapping
some of the Hashicorp Ruby libraries. Switching from using the chef resource to using pure Ruby has the advantage of more freedom, as this way you can interact
with the vault client directly. It goes like this:

```ruby
include_recipe 'sbg_vault::chef_auth'

vault_client = SbgVault.client(:chefauth, node)
secret = vault_client.logical.read('secret/path/to/your/secret') # read this, even at compile time! This method returns a Vault::Secret ruby object

# The source code for that object is at https://github.com/hashicorp/vault-ruby/blob/master/lib/vault/api/secret.rb

secret_in_hash_form = secret.data # this returns a frozen ruby hash of the secret from hashicorp vault

unfrozen_secret = secret.data.dup # you can duplicate secret.data to get a ruby hash that you can then modify

# LITERALLY ANY SORT OF RUBY MAGIC IS NOW POSSIBLE!

secret_to_write = { key1: 'value1', key2: 'value2' }
vault_client.logical.write('secret/path/to/your/secret', secret_to_write) # this is how you write to hashicorp vault
```

While this seems like such a simple and empowering solution, I don't think it should be abused, or used without caution. Glancing over the above snippet, I cannot
help but notice how close that is to a data leak:

```ruby
include_recipe 'sbg_vault::chef_auth'

vault_client = SbgVault.client(:chefauth, node)
secret = vault_client.logical.read('secret/path/to/your/secret')

# the below line may result in a data leak
node.override['secret_in_hash_form'] = secret.data

unfrozen_secret = secret.data.dup
# More code ...
```

As I see it, unchaining of the restrictions built into Chef resources comes with a big responsibility. Now, it is entirely within the programmer's hands wether
the secret is handled securely or not. I am of the mindset that more freedom is good for a programmer, but this experience taught me a lesson of responsibility.

## Chef runs Ruby before Ruby runs Chef

For the second part of my post, I will stray from the world of secrets and vaults to talk about something more mundane in the world of DevOps. it is something
that any Chef geek learns at some point, something that I really smashed into head first recently, and learnt the hard way. Yet, it is something that I see worthy
of being shared in as many places as possible, because it illustrates the nature of Chef as a CM tool, and its difference to Ruby. I put this in the same blog
post as I have discovered this while working on the same feature that required me sieging down Hashicorp Vault. I have learnt that Chef runs Ruby before Ruby runs
Chef.

### The problem
As documented in places such as [this chef documentation page](https://docs.chef.io/chef_client_overview.html), chef-client does a lot of magic. First thing it
does is, it gathers data about the existing server config using _ohai_, then it connects to chef server, and it populates attributes and compiles all the
resources in the `run_list` (*and runs all ruby code in your recipes!*). This is problematic if you want to stray from using pure chef resources in your recipes,
because if you try to use Ruby and Chef resources in a sequential manner, you do not end up with the sequence you believe. One example would be if you want some
Ruby logic based on a piece of configuration for the server, Ruby will get executed but any resources in-between your logic will not, not at compile time. Then,
at runtime, if the execution of a chef resource changes the state of the server config, the Ruby logic you rely on will not change state. For instance:

```ruby
old_file_content = ::File.read('/path/to/a/file')

file '/path/to/a/file' do
    content 'A different content from what it originally had'
    action :create
end

if ::File.read('/path/to/a/file') != old_file_content
    file '/home/sandua/report'
end
```
The above is a simplification of a problem I had. I expected to have the report file created when the file content changed. It did not. And that is because the if
statement is executed before the first file resource.

### The solution
The solution to this is to obey our lord and saviour the Chef resource. By that, I mean use the `ruby_block` resource and have all code run at run time. I think
it may be worthwhile to consider all ruby code wrapped in `ruby_block` resources, because it would have saved me loads of headaches with the above. The above
example is solved as follows:

```ruby
ruby_block 'read file before you do anything to it' do
    block do
        old_file_content = ::File.read('/path/to/a/file')
    end
    action :run
end

file '/path/to/a/file' do
    content 'A different content from what it originally had'
    action :create
end

file '/home/sandua/report' do
    action :create
    only_if ::File.read('/path/to/a/file') != old_file_content
end
```
