# EC2 Deployment Guide

This project deploys to Ubuntu EC2 at `/home/ubuntu/dnr` and runs as a full-stack Next.js app using:

- `npm ci`
- `npm run build`
- `npm run start`
- PM2 for process management
- Nginx as a reverse proxy to port `3000`
- GitHub Actions for auto-deploy on push to `main`

## 1. Generate a deploy key on EC2 for GitHub repo access

SSH into the server:

```bash
ssh -i dnr_key.pem ubuntu@52.201.222.47
```

Generate a keypair on EC2:

```bash
ssh-keygen -t ed25519 -C "dnr-ec2-deploy-key" -f ~/.ssh/dnr_repo_key
cat ~/.ssh/dnr_repo_key.pub
```

Add the printed public key in GitHub:

- GitHub repo -> `Settings` -> `Deploy keys`
- Click `Add deploy key`
- Paste the public key
- Allow write access only if the server itself needs to push back to GitHub

Add an SSH config entry on EC2:

```bash
cat <<'EOF' >> ~/.ssh/config
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/dnr_repo_key
  IdentitiesOnly yes
EOF

chmod 600 ~/.ssh/config ~/.ssh/dnr_repo_key
chmod 644 ~/.ssh/dnr_repo_key.pub
ssh -T git@github.com
```

Clone the repo to the exact deployment path if it is not already there:

```bash
git clone git@github.com:YOUR_GITHUB_USERNAME/YOUR_REPO.git /home/ubuntu/dnr
```

## 2. Generate a separate SSH key locally for GitHub Actions -> EC2

Run this on your local machine:

```bash
ssh-keygen -t ed25519 -C "github-actions-ec2" -f ~/.ssh/github_actions_ec2
cat ~/.ssh/github_actions_ec2.pub
```

Append the public key to EC2:

```bash
ssh -i dnr_key.pem ubuntu@52.201.222.47
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Copy the private key content for GitHub Actions:

```bash
cat ~/.ssh/github_actions_ec2
```

## 3. Add GitHub repository secrets

Add these repo secrets in GitHub -> `Settings` -> `Secrets and variables` -> `Actions`:

- `EC2_HOST` -> `52.201.222.47`
- `EC2_USER` -> `ubuntu`
- `EC2_SSH_KEY` -> contents of `~/.ssh/github_actions_ec2`

You will also likely want app secrets in your EC2 `.env.local`, not in GitHub Actions:

- `MONGODB_URI`
- `JWT_SECRET`
- `S3_BUCKET`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

## 4. Install Node 20, PM2, and Nginx on Ubuntu

SSH to EC2 and run:

```bash
sudo apt update
sudo apt install -y curl gnupg ca-certificates
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm install -g pm2

node -v
npm -v
pm2 -v
nginx -v
```

## 5. Create environment file on EC2

Create `/home/ubuntu/dnr/.env.local`:

```bash
cat <<'EOF' > /home/ubuntu/dnr/.env.local
NODE_ENV=production
PORT=3000
MONGODB_URI=YOUR_VALUE
JWT_SECRET=YOUR_VALUE
S3_BUCKET=YOUR_VALUE
AWS_REGION=YOUR_VALUE
AWS_ACCESS_KEY_ID=YOUR_VALUE
AWS_SECRET_ACCESS_KEY=YOUR_VALUE
EOF
```

## 6. First deployment run on EC2

Run once manually on EC2:

```bash
cd /home/ubuntu/dnr
npm ci --legacy-peer-deps
npm run build
pm2 start /home/ubuntu/dnr/ecosystem.config.cjs
pm2 save
pm2 status
```

## 7. Set up PM2 startup

Run the PM2 startup command and then execute the command it prints:

```bash
pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save
```

## 8. Set up Nginx reverse proxy

Create the site config:

```bash
sudo tee /etc/nginx/sites-available/dnr >/dev/null <<'EOF'
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_EC2_IP;

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF
```

Enable it and reload Nginx:

```bash
sudo ln -sf /etc/nginx/sites-available/dnr /etc/nginx/sites-enabled/dnr
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## 9. Test the deployment

Test locally on EC2:

```bash
curl -I http://127.0.0.1:3000
curl -I http://52.201.222.47
pm2 status
pm2 logs dnr-modern --lines 100
```

## 10. Optional HTTPS with certbot

If a domain is pointed to this EC2 instance:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 11. Auto-deploy flow

The GitHub Actions workflow at `.github/workflows/deploy.yml` runs on every push to `main` and executes:

```bash
cd /home/ubuntu/dnr
git fetch origin
git reset --hard origin/main
npm ci --legacy-peer-deps
npm run build
pm2 restart dnr-modern || pm2 start /home/ubuntu/dnr/ecosystem.config.cjs
pm2 save
```

## 12. Handy recovery commands

If a deployment fails:

```bash
cd /home/ubuntu/dnr
git status
git fetch origin
git reset --hard origin/main
npm ci --legacy-peer-deps
npm run build
pm2 restart dnr-modern || pm2 start /home/ubuntu/dnr/ecosystem.config.cjs
pm2 logs dnr-modern --lines 100
```
