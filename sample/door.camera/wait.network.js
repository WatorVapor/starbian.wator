const execSync = require("child_process").execSync; 
let log = execSync('ping www.wator.xyz');
console.log('log=<',log,'>');
