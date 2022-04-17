var fs = require('fs'); var cp = require('child_process'); var files = fs.readdirSync("./");
(async() => {
    console.log(files, `\nStarting with the 1. / ${files.length} Files: ${files[0]} in:\n NOW!`);

    for(const file of files) {
        const srcDir = `${process.cwd()}/toupdate/`;
        const destDir = `${process.cwd()}/'${file}'/`;
        if(!fs.lstatSync(`./${file}`).isDirectory()) { console.log(destDir + " | Not a Folder, continue"); continue; }
        if(destDir.includes("toupdate")) { console.log(destDir + " | update folder, continue"); continue; }
        console.log("EXECUTING THE CMD", `rsync -avr ${srcDir} ${destDir}`);
        await new Promise((res, rej) => { 
          cp.exec(`rsync -avr ${srcDir} ${destDir}`, {maxBuffer: 1024 * 500 * 1024}, (err, stdout, stderr) => {
            if (err) return console.error(err);
            if(stderr) console.log(stderr)
            console.log( "FINISHED: "+ destDir)
            cp.exec(`rsync -r ${srcDir} ${destDir}`, {maxBuffer: 1024 * 500 * 1024}, (err, stdout, stderr) => {
                if (err) return console.error(err);
                if(stderr) console.log(stderr)
                console.log( "FINISHED-2-SECURE-COPY: "+ destDir) 
                res(true);
            });
          });
        });
        await new Promise((res)=>setTimeout(()=>res(2),1000));
    }
})();