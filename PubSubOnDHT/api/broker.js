const BrokerCluster = require('./broker.cluster.js');
const BrokerPubSub = require('./broker.pubsub.js');
class Broker {
  constructor(config) {
    this.config_ = config;
    this.cluster_ = new BrokerCluster(config);
    this.pubsub_ = new BrokerPubSub(config);
    this.pubsub_.setCluster(this.cluster_);
  }
};
module.exports = Broker;
