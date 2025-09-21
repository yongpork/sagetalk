module.exports = {
  apps: [
    {
      name: 'WebSageChat',
      script: 'npm',
      args: 'run dev -- --hostname 0.0.0.0',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_file: './logs/websagechat.log',
      error_file: './logs/websagechat-error.log',
      out_file: './logs/websagechat-out.log',
      time: true
    }
  ]
};
