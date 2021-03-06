#!/usr/bin/env node

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
  console.error(error);
  process.exit(1);
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

function tallyAccessible(results) {
  var accessibles = [];
  for (var db in results) {
    var response = results[db][0];
    if (response.statusCode !== 401) {
      accessibles.push(db);
    }
  }
  return accessibles;
}

function log(results) {
  if (results.length > 0) {
    console.log(results.join('\n'));
    process.exit(1);
  }
}

request(couchdb + '/_all_dbs')
  .spread(responseHandler)
  .then(filterWhitelist)
  .then(createQueries)
  .props()
  .then(tallyAccessible)
  .then(log)
  .catch(errorHandler);
