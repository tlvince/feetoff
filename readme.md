# feetoff

> Pre-emptive authentication monitoring for CouchDB

Queries every database found in a given CouchDB instance and returns a list
that are accessible.

## Usage

1. Copy `config/default.example.json` and populate its values according to the
   table below
2. Run `npm start`

A list of accessible databases is returned:

```shell
_replicator
_users
public
```

## Config

Property    | Description
--------    | -----------
`couchdb`   | A URL to a CouchDB instance
`whitelist` | A list of database names known to be accessible

## Usecases

* By omitting CouchDB authentication credentials, `feetoff` can be used to
  check which databases are publicly accessible.

## Author

© 2014 Tom Vincent <https://tlvince.com/contact>

## License

Licensed under the [MIT license](http://tlvince.mit-license.org).
