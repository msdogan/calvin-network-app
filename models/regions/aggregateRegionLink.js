'use strict';
var utils = require('./utils');

var collection = global.setup.database.collection('regions');
var networkCollection = global.setup.database.collection('network');
var extrasCollection = global.setup.database.collection('node-extras');

module.exports = function(origin, terminus, callback) {
  validateRegionFlow(origin, terminus, function(err, valid){
    if( err ) {
      return callback(err);
    }
    utils.getNodesInRegion(origin, function(err, originlist){
      utils.getNodesInRegion(terminus, function(err, terminallist){

        runAggregate(originlist, terminallist, function(err, result){
          callback(err, result);
        });
      });
    });
  });
};

function validateRegionFlow(origin, terminus, callback) {
  utils.getNodeType(origin, function(err, origintype){
    if( err ) {
      return callback(err);
    }

    utils.getNodeType(terminus, function(err, terminustype){
      if( err ) {
        return callback(err);
      }

      if( origintype !== 'Region' && terminustype !== 'Region' ) {
        return callback('Invalid origin and terminus.  At least one needs to be a region');
      }

      callback(null, true);
    });
  });
}




function runAggregate(originlist, terminallist, callback) {
  networkCollection.find({
    'properties.origin' : {
      '$in' : originlist
    },
    'properties.terminus' : {
      '$in' : terminallist
    }
  },{'properties.prmname':1, 'properties.amplitude':1}).toArray(function(err, result){
    if( err ) {
      return callback(err);
    }

    var list = [];
    var lookup = {};
    for( var i = 0; i < result.length; i++ ) {
      list.push(result[i].properties.prmname);
      lookup[result[i].properties.prmname] = result[i].properties.amplitude;
    }

    var data = {};

    utils.sumInto(list, 'flow', 'flow', data, function(sum, label, item, prmname){
        sumFlow(sum, item, lookup[prmname]);
      }, function(err){
        if( err ) {
          return callback(err);
        }
        
        var resp = {
          included : list,
          data : data
        };

        callback(null, resp);
    });
  });
}



function sumFlow(sum, item, amplitude) {
  if( amplitude === undefined || amplitude === null ) {
    amplitude = 0;
  } else {
    // this is crazyness
    //amplitude = 1 / (1 - amplitude);
    //amplitude = 1 - amplitude;
    amplitude = 0.25 * amplitude;
  }


  for( var i = 0; i < item.length; i++ ) {
    if( i === 0 && typeof item[0][1] === 'string' ) {
      continue;
    }

    var flow = item[i][1] || 0;
    if( sum[item[i][0]] === undefined ) {
      sum[item[i][0]] = {
        flow : flow,
        amplitudeLoss : amplitude*flow
      };
    } else {
      sum[item[i][0]].flow += flow;
      sum[item[i][0]].amplitudeLoss += amplitude*flow;
    }
  }
}