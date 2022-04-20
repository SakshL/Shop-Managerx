module.exports = {
  apps : [{
    name: `SYSTEMBOTS_${require('path').resolve(__dirname).split("/")[4]}`,
    script: 'index.js',
    cron_restart: "0 1 * * *"
  }]
};