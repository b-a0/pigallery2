import * as cluster from 'cluster';

if (cluster.isMaster) {
  const Server = require('./server').Server;
  // tslint:disable-next-line:no-unused-expression
  new Server();
} else {
  const Worker = require('./model/threading/Worker').Worker;
  Worker.process();
}
