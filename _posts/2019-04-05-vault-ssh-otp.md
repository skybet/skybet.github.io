---
title: "Vault SSH With OTP"
date: 2019-04-05
summary: "Let's configure SSH authentication with Hashicorp's Vault using the OTP method, find out why you would use this instead of the signed keys method, and whether Vault's SSH Engine is even what you are looking for."
layout: "post"
category: Devops
tags: hashicorp
author: alice_kaerast
---

Lance LeFlore has a [great blog post](https://abridge2devnull.com/posts/2018/05/leveraging-hashicorp-vaults-ssh-secrets-engine/) on using [HashiCorp Vault](https://www.vaultproject.io)'s [SSH secrets engine](https://www.vaultproject.io/docs/secrets/ssh/index.html), but only covers the method which uses signed SSH keys.  Whilst signed SSH keys is probably the easier of the methods to use, for completeness it is also worth knowing about the alternative [OTP (One Time Password) method](https://www.vaultproject.io/docs/secrets/ssh/one-time-ssh-passwords.html) and why you might use it.

So let's get that setup in Docker, using CentOS 7 because that's our preferred method.

First of all lets spin up a container and name it `vault` so that we can reuse it later on:

```bash
docker run --rm -ti --name vault centos:7
```

We can now install some required dependencies and then Vault itself:

```bash
yum -y -q install curl unzip openssh openssh-server openssh-clients
yum -y -q install https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
yum -y -q install sshpass

export VAULT_VERSION=1.1.0
curl -LO https://releases.hashicorp.com/vault/${VAULT_VERSION}/vault_${VAULT_VERSION}_linux_amd64.zip

curl -LO https://releases.hashicorp.com/vault/${VAULT_VERSION}/vault_${VAULT_VERSION}_SHA256SUMS
grep "vault_${VAULT_VERSION}_linux_amd64.zip" vault_${VAULT_VERSION}_SHA256SUMS | sha256sum -c -

unzip -q vault_${VAULT_VERSION}_linux_amd64.zip
cp vault /usr/local/bin/
```

We can now configure and launch Vault using some development settings:

```bash
mkdir hvault
cat > config.hcl <<EOF
listener "tcp" {
    address     = "0.0.0.0:8200"
    tls_disable = true # don't do this in production - always use TLS in prod
}

storage "file" {
    path = "./hvault"
}

disable_mlock = true # don't do this in production either
# ^ setting this to true allows leaking of sensitive data to disk/swap
# we're doing it here to avoid running the process as root
# or modifying any system tunables
EOF

vault server -config=config.hcl
```

This will launch the server in the foreground, so we'll want to connect to the Docker container in a new terminal:

```bash
docker exec -ti vault /bin/bash
```

Now we can configure Vault as a client and make sure we have a connection:

```bash
export VAULT_ADDR="http://127.0.0.1:8200"
echo 'export VAULT_ADDR="http://127.0.0.1:8200"' >> ~/.bashrc
vault status
```

Finally, we can initialise Vault to make it ready to use:

```bash
vault operator init -key-shares=1 -key-threshold=1

# this will give you a vault token and an unseal key.  Use these now:

read -s -p "Initial Root Token: " vault_token
echo $vault_token > ~/.vault-token

vault operator unseal # provide 'Unseal Key 1:'

vault token lookup
```

Now we have Vault running, a client connected, and have made sure we have a valid token.  The next step is to enable the secrets engine:

```bash
vault secrets enable -path=ssh-client ssh
```

We can then create a role which will allow us to ssh as the root user to any of our SSH servers (any IP address):

```bash
vault write ssh-client/roles/otp_key_role key_type=otp default_user=root cidr_list=0.0.0.0/0
```

With that in place, we now need to configure our SSH servers to use the vault-ssh-helper.  First of all we need to download and configure the vault-ssh-helper tool itself:

```bash
curl -C - -k https://releases.hashicorp.com/vault-ssh-helper/0.1.4/vault-ssh-helper_0.1.4_linux_amd64.zip -o vault-ssh-helper.zip
unzip vault-ssh-helper.zip
mv vault-ssh-helper /usr/local/bin/

mkdir /etc/vault-ssh-helper.d
cat > /etc/vault-ssh-helper.d/config.hcl << EOL
vault_addr = "http://172.17.0.2:8200"
ssh_mount_point = "ssh-client"
ca_cert = "/etc/vault-ssh-helper.d/vault.crt"
tls_skip_verify = false
allowed_roles = "*"
EOL
vault-ssh-helper -dev -verify-only -config=/etc/vault-ssh-helper.d/config.hcl
```

Then we need to configure both PAM and SSHD to use vault-ssh-helper:

```bash
cat > /etc/pam.d/sshd << EOL
#%PAM-1.0
auth        required    pam_sepermit.so
#auth       substack    password-auth # COMMENT OUT FOR SSH-HELPER
auth        include     postlogin
auth        requisite   pam_exec.so quiet expose_authtok log=/var/log/vaultssh.log /usr/local/bin/vault-ssh-helper -dev -config=/etc/vault-ssh-helper.d/config.hcl
auth        optional    pam_unix.so not_set_pass use_first_pass nodelay
# Used with polkit to reauthorize users in remote sessions
-auth       optional    pam_reauthorize.so prepare
account     required    pam_nologin.so
account     include     password-auth
#password   include     password-auth # COMMENT OUT FOR SSH-HELPER
# pam_selinux.so close should be the first session rule
session     required    pam_selinux.so close
session     required    pam_loginuid.so
# pam_selinux.so open should only be followed by sessions to be executed in the user context
session     required    pam_selinux.so open env_params
session     required    pam_namespace.so
session     optional    pam_keyinit.so force revoke
session     include     password-auth
session     include     postlogin
# Used with polkit to reauthorize users in remote sessions
-session   optional     pam_reauthorize.so prepare
EOL

vi /etc/ssh/sshd_config
# Set the following three options:
# ChallengeResponseAuthentication yes
# PasswordAuthentication no 
# UsePAM yes
```

And finally, because we are in a container without systemd access, we'll cheat and run sshd ourselves rather than via systemd:

```bash
/usr/sbin/sshd-keygen
/usr/sbin/sshd -f /etc/ssh/sshd_config
```

We are now fully setup and ready to use ssh with vault.  Let's ask for access to 127.0.0.1, and then ssh in:

```bash
vault write ssh-client/creds/otp_key_role ip=127.0.0.1
vault ssh -role otp_key_role -mode otp -strict-host-key-checking=no -mount-point=ssh-client root@127.0.0.1
```

We now have a good idea on what is required to configure our SSH servers to use the One-Time Password method of SSH authentication.

The setup is somewhat more complicated than the Signed SSH Certificates method, because we have to configure PAM and install an additional helper on every single server that we want to SSH into.  But the benefit is that we are requesting a One Time Password every single time that we initiate an SSH connection, which means that every request is audited in Vault.  It's up to you to decide on which you'd prefer to use.

Note that both of these methods are designed to allow multiple users to gain access to a limited number of system accounts.  They are not designed to provide a method for individual users to authenticate as themselves, for this Vault provides zero benefit.  If your users are authenticating against Vault using LDAP credentials, then you would configure PAM to authenticate these same users with the same LDAP binding - not needing Vault at all.