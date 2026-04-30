module.exports = {
  apps: [
    {
      name: "praxis-kennzahlen",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/praxis-kennzahlen",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};
