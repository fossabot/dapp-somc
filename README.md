[![Maintainability](https://api.codeclimate.com/v1/badges/70f41c722e08e51b2ea6/maintainability)](https://codeclimate.com/github/Privatix/dapp-somc/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/70f41c722e08e51b2ea6/test_coverage)](https://codeclimate.com/github/Privatix/dapp-somc/test_coverage)
[![Dependency Status](https://david-dm.org/Privatix/dapp-somc.svg)](https://david-dm.org/Privatix/dapp-somc)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FPrivatix%2Fdapp-somc.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FPrivatix%2Fdapp-somc?ref=badge_shield)

# Service Offering Messaging Channel

Service Offering Messaging Channel (SOMC) is channel that used to publish full Service Offering message, Authentication message and Service Endpoint message. Used by Agent and Client to exchange necessary information that allow Client to start using Privatix Service proposed by Agent.

# Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

## Prerequisites

Install prerequisite software:
* [nodejs v9.3+](https://nodejs.org/en/download/)
* [npm v5.6+](https://www.npmjs.com/)
* [mongodb](https://docs.mongodb.com/manual/installation/)

## Installation steps

Clone the `dapp-somc` repository using git and initialize the modules:

```
mkdir SOMC && cd SOMC
git clone https://github.com/Privatix/dapp-somc.git  
```

Install dependencies:

```
npm install
```

Checking installation succeed:

* Check versions of `nodejs` and `npm`
* Check work of `mongodb`
* Check log of installed modules

# Tests

## Preparing environment

* Default environment is `dev`. For change it set environment variable `NODE_ENV`
* Change config file in `config/dev.js` or other name of file from environment variable `NODE_ENV`
* In `config` file set:
  * `mongo.url` — url for connection to mongodb
  * `ws.host` — host of listenning SOMC
  * `ws.port` — port of listenning SOMC  

## Running the tests

Tests are run using the following command:

```
npm test
```

# Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/Privatix/dapp-somc/tags).

## Authors

* [lart5](https://github.com/lart5)

See also the list of [contributors](https://github.com/Privatix/dapp-somc/contributors) who participated in this project.


# License

This project is licensed under the **GPL-3.0 License** - see the [COPYING](COPYING) file for details.


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FPrivatix%2Fdapp-somc.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FPrivatix%2Fdapp-somc?ref=badge_large)