module.exports = {
  apps: [
    {
      name: "explit",
      script: "npm",
      args: "start",
      user: "plone",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 5001,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5001,
      },
    },
  ],
};
