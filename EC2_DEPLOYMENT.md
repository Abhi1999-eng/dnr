# EC2 Deployment Guide

> This repository is **public**. Real account IDs, instance IDs, security group IDs and
> IP addresses are deliberately kept out of this file — every `<PLACEHOLDER>` below stands
> for a value held privately. Substitute them from your own records or the AWS console.

Current production host, provisioned 2026-10-23.

| | |
| --- | --- |
| AWS account | `<AWS_ACCOUNT_ID>` |
| Region | `us-east-1` (AZ `<AZ>`) |
| Instance | `<DNR_INSTANCE_ID>` — tagged `dnr-production` |
| Elastic IP | `<DNR_ELASTIC_IP>` |
| Type | t3.small, Ubuntu 24.04 LTS, 20 GB gp3 (encrypted) |
| Security group | `<DNR_SECURITY_GROUP_ID>` — inbound **80 and 443 only** |
| Shell access | **AWS Systems Manager, not SSH** |
| App path | `/home/ubuntu/dnr` |
| Process manager | PM2, app name `dnr-modern`, port 3000 |
| Reverse proxy | Nginx, site config `/etc/nginx/sites-available/dnr` |

The previous host referenced by earlier revisions of this guide (`the previous Elastic IP`) no
longer exists.

## Shell access

This instance has **no SSH keypair and port 22 is closed**, matching the other hosts in
this account. Get a shell through Systems Manager instead:

```bash
aws ssm start-session --profile scaleqode --region us-east-1 --target <DNR_INSTANCE_ID>
```

Or in the console: EC2 → select `dnr-production` → Connect → Session Manager.

Sessions start as `root`, so switch to the app user before touching the repo — git will
otherwise refuse the directory as having dubious ownership:

```bash
sudo -u ubuntu -H bash -l
cd /home/ubuntu/dnr
```

## What the instance already has

Installed by the launch bootstrap, logged to `/var/log/dnr-bootstrap.log`:

- Node.js 20, npm, PM2, Nginx
- 2 GB swap at `/swapfile` — a Next.js build exceeds t3.small's 2 GB of RAM without it
- The repository cloned over HTTPS to `/home/ubuntu/dnr` (the repo is public, so the box
  needs no deploy key)
- Nginx reverse proxy to `127.0.0.1:3000`, enabled, with the default site removed
- `/home/ubuntu/dnr/.env.local` created with placeholder secrets, mode 600
- `/home/ubuntu/finish-deploy.sh`

## Finishing the first deployment

The build cannot run unattended, because `lib/db.ts` falls back to
`mongodb://127.0.0.1:27017` when `MONGODB_URI` is unset and no MongoDB runs on this box —
the build fails while prerendering pages that read from the database.

Fill the secrets first:

```bash
sudo -u ubuntu nano /home/ubuntu/dnr/.env.local
```

`MONGODB_URI` and `JWT_SECRET` are both required. Then:

```bash
sudo -u ubuntu /home/ubuntu/finish-deploy.sh
```

That script refuses to run while placeholders remain, then fetches `main`, installs,
builds, starts the app under PM2, and persists the PM2 process list across reboots.

## DNS

`dnrtechnoservices.com` is registered at GoDaddy and its NS records point at four Route 53
nameservers, but **no Route 53 hosted zone exists in this account**, so the domain returns
SERVFAIL and resolves to nothing.

Either recreate the hosted zone and update the NS records at GoDaddy — note the domain
carries `clientUpdateProhibited`, which must be unlocked there first — or point DNS at the
Elastic IP directly from whichever provider holds the zone:

| Record | Type | Value |
| ------ | ---- | ----- |
| `dnrtechnoservices.com` | A | `<DNR_ELASTIC_IP>` |
| `www` | CNAME | `dnrtechnoservices.com` |

## HTTPS

Run certbot only after DNS resolves to this instance, or the HTTP-01 challenge fails:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d dnrtechnoservices.com -d www.dnrtechnoservices.com
```

## Auto-deploy

`.github/workflows/deploy.yml` deploys on push to `main` over **SSH** to `secrets.PROD_HOST`.
It cannot reach this instance as written, because port 22 is closed and no keypair is
attached. Pick one:

1. **Keep deploys manual** — run `finish-deploy.sh` over a Session Manager shell. No
   change needed, and the security group stays closed.
2. **Switch the workflow to SSM** — give GitHub Actions an IAM user or OIDC role with
   `ssm:SendCommand` on this instance and replace the ssh-action step with
   `aws ssm send-command`. Keeps port 22 closed.
3. **Restore SSH** — attach a keypair, open port 22 to GitHub's ranges or a bastion, and
   update `PROD_HOST`. Simplest, but widens the attack surface.

## Routine redeploy

```bash
sudo -u ubuntu -H bash -lc 'cd /home/ubuntu/dnr && git fetch origin && git reset --hard origin/main && npm ci && npm run build && pm2 restart dnr-modern && pm2 save'
```

## Checks

```bash
curl -sI http://127.0.0.1:3000 | head -1     # on the box
curl -sI http://<DNR_ELASTIC_IP> | head -1      # from anywhere
sudo -u ubuntu pm2 status
sudo -u ubuntu pm2 logs dnr-modern --lines 100
sudo nginx -t && systemctl status nginx --no-pager
```

A 502 from Nginx means Nginx is healthy but the app is not listening on 3000 — check PM2.

## Other instances in this account

This AWS account also hosts unrelated projects on their own instances. They share no
configuration with DNR — no common Nginx config, PM2 process list, or security group.
Leave them alone.
