module.exports = {
 apps: [
  {
   name: "Bot Managerx",
   script: "./index.js",
   watch: true,
   exec_mode: "cluster",
   ignore_watch: ["[/\\]./", "^.sqlite", "dbs", "node_modules", "databases", "cache", "^.", "^[.]", ".git"],
   watch_options: {
    followSymlinks: false,
   },
   args: ["--color"],
  },
 ]
}
