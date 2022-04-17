/**
 * COPIES DATA FROM THE UDPATE SERVER AND UPDATES THE FILES IN HERE
 */
const storageServerIP = `storage.milrato.dev`;
var fs = require('fs'); var cp = require('child_process'); var files = fs.readdirSync("./");
//clear out the toupdate folder in here
cp.exec(`rm ${process.cwd()}/toupdate/* -rf`, { maxBuffer: 1024 * 500 * 1024 }, async (err, stdout, stderr) => {
    //that's the path of the toupadate folder
    const toUpdate = `${process.cwd()}/toupdate/`;
    //That's the path of the SOURCE DIR from my SOURCE SERVER
    const toUpdateSync = `${storageServerIP}:${process.cwd().replace("servicebots", "templates/toupdate")}/toupdate/`;
    //copy paste all of the files from my SOURCE SERVER toupdate FOLDER into the TOUPDATE folder of this server
    console.log("EXECUTING THE SECURITY CMD", `rsync -rav ${toUpdateSync} ${toUpdate}`);
    cp.exec(`rsync -rav ${toUpdateSync} ${toUpdate}`, { maxBuffer: 1024 * 500 * 1024 }, async (err, stdout, stderr) => {
        if (err) return console.error(err);
        if (stderr) console.log(stderr)
        //INTERFACE INFORMATION
        for (let i = 5; i >= 0; i--) {
            console.clear();
            console.log(`Finished copying from: ${toUpdateSync}`);
            if (i > 0) {
                console.log(files, `\nStarting with the 1. / ${files.length} Files: ${files[0]} in:\n ${i} Second${i > 1 ? "s" : ""}`);
                await new Promise((res) => setTimeout(() => res(2), 1000));
            } else {
                console.log(files, `\nStarting with the 1. / ${files.length} Files: ${files[0]} in:\n NOW!`);
            }
        }
        //copy paste into each new folder with overwrite but without deletion + a secure copy which means to try again for any "mistakes"
        for (const file of files) {;
            const destDir = `${process.cwd()}/'${file}'/`;
            if (!fs.lstatSync(`./${file}`).isDirectory()) { console.log(destDir + " | Not a Folder, continue"); continue; }
            if (destDir.includes("toupdate")) { console.log(destDir + " | update folder, continue"); continue; }
            await new Promise((res, rej) => { 
                cp.exec(`rsync -avr ${toUpdate} ${destDir}`, {maxBuffer: 1024 * 500 * 1024}, (err, stdout, stderr) => {
                    if (err) return console.error(err);
                    if(stderr) console.log(stderr)
                    console.log( "FINISHED: "+ destDir)
                    console.log("EXECUTING THE SECURITY CMD", `rsync -avr ${toUpdate} ${destDir}`);
                    cp.exec(`rsync -avr ${toUpdate} ${destDir}`, {maxBuffer: 1024 * 500 * 1024}, (err, stdout, stderr) => {
                        if (err) return console.error(err);
                        if(stderr) console.log(stderr)
                        console.log( "FINISHED-2-SECURE-COPY: "+ destDir) 
                        res(true);
                    });
                });
            });
            await new Promise((res)=>setTimeout(()=>res(2),1000));
        }
    });
});