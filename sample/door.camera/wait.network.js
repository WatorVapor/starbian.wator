const execSync = require("child_process").execSync;
while(true) {
  try {
    let log = execSync('ping -c 1 www2.wator.xyz');
    console.log('log=<',log,'>');
  } catch(e) {
    console.error('e=<',e,'>');
  }
}
