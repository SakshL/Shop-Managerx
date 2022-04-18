module.exports = {
 apps: [
  {
   name: "Bot Managerx",
   script: "./index.js",
   watch: true,
   exec_mode: "cluster",
   ignore_watch: ["[/\\]./", "^.sqlite", "[/\\].html", "dbs", "node_modules", "*.html", "servicebots", "^.html", "databases", "cache", "^.", "^[.]", ".git"],
   watch_options: {
    followSymlinks: false,
   },
   args: ["--color"],
  },
 ]
}
