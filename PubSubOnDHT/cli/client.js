const PubSub = require('../api/pubsub.js');
const options = {
  bootstrap:[
    {
      host:'localhost',
      port:11234
    }
  ],
  masterKey:{
    
  }
}
const pub = new PubSub(options);
