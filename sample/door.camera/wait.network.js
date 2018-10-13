const execSync = require("child_process").execSync; 
let log = execSync('ping -c 1 www.wator.xyz');
console.log('log=<',log,'>');
