'use strict';

var config = require('config');
var request = require('request');
var Promise = require('bluebird');

var couchdb = config.get('couchdb');

request = request.defaults({
  json: true
});

request = Promise.promisify(request);

function errorHandler(error) {
  if (error.body) {
    error = error.body;
  }
  console.error(JSON.stringify(error));
}

function responseHandler(response, body) {
  if (response.statusCode !== 200) {
    return Promise.reject(response);
  }
  return body;
}

function filterWhitelist(dbs) {
  var whitelist = config.whitelist || [];
  function difference(db) {
    return whitelist.indexOf(db) === -1;
  }
  return dbs.filter(difference);
}

function createQueries(dbs) {
  var query = {};
  function mapQuery(name) {
    query[name] = request(couchdb + '/' + name);
  }
  dbs.forEach(mapQuery);
  return query;
}

function parseResults(results) {
  var parsed = {};
  function parse(db, result) {
    var body = result[1];
    parsed[db] = body;
  }
  for (var db in results) {
    parse(db, results[db]);
  }
  return parsed;
}

function tallyAccessible(results) {
  var accessibles = [];
  for (var db in results) {
    var result = results[db];
    if (!result.error) {
      accessibles.push(db);
    }
  }
  return accessibles;
}

function log(results) {
  var json = {
    accessible: results
  };
  console.log(JSON.stringify(json));
}

function feetoff() {
  return request(couchdb + '/_all_dbs')
    .spread(responseHandler)
    .then(filterWhitelist)
    .then(createQueries)
    .props()
    .then(parseResults)
    .then(tallyAccessible)
    .then(log)
    .catch(errorHandler);
}

feetoff();
