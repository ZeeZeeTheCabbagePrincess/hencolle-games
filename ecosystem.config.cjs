module.exports = {
  apps: [
    {
      name: "hencollegames",
      script: "./serve.js",
      cwd: __dirname,
      env: {
        HOST: "127.0.0.1",
        PORT: "4173"
      }
    }
  ]
};
