module.exports = {
  apps: [
    {
      name: 'dnr-modern',
      script: './node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/home/ubuntu/dnr',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
