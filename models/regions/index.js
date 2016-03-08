'use strict';

var aggregateFlow = require('./aggregateFlow');
var aggregateInflows = require('./aggregateInflows');
var aggregateSinks = require('./aggregateSinks');
var aggregateRegion = require('./aggregateRegion');
var aggregateRegionLink = require('./aggregateRegionLink');

/*
 *   Currently supported types
 */
var supportedAggregateTypes = ['inflows', 'flow', 'sinks'];

module.exports = function(config) {
    require('./utils').init(config.collections);

    collection = config.collections.regions;
    networkCollection = config.collections.network;
    extrasCollection = config.collections.extras;

    return {
        name: 'regions',
        aggregate : aggregate,
        aggregateRegion : aggregateRegion,
        aggregateRegionLinks : aggregateRegionLinks
    };
};


function aggregateRegionLinks(n1, n2, callback) {
  var resp = {
    data : []
  };

  aggregateRegionLink(n1, n2, function(err, data){
    data.origin = n1;
    data.terminus = n2;

    resp.data.push(data);

    aggregateRegionLink(n2, n1, function(err, data){
      data.origin = n2;
      data.terminus = n1;

      resp.data.push(data);

      callback(null, resp);
    });
  });
}

function aggregate(type, region, terminus, callback) {
  if( supportedAggregateTypes.indexOf(type) === -1 ) {
    return callback('Unsupported aggregate type: '+type+'.  Supported types: '+supportedAggregateTypes.join(', '));
  }

  if( type === 'flow' ) {
    aggregateFlow(region, terminus, callback);
  } else if( type === 'inflows' ) {
    aggregateInflows(region, callback);
  } else if( type === 'sinks' ) {
    aggregateSinks(region, callback);
  } else {
    callback('Badness');
  }
}
