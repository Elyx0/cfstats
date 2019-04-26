
[![GitHub license](https://img.shields.io/badge/license-ISC-blue.svg)](https://github.com/facebook/react/blob/master/LICENSE)  [![Build Status](https://travis-ci.org/Elyx0/touchtunes.svg?branch=master)](https://travis-ci.org/Elyx0/touchtunes/)[![Known Vulnerabilities](https://snyk.io/test/npm/snyk/badge.svg)](https://snyk.io/synk/github/elyx0/touchtunes) [![Coverage Status](https://coveralls.io/repos/github/Elyx0/touchtunes/badge.svg?branch=master)](https://coveralls.io/github/Elyx0/touchtunes?branch=master)


### CFStats.com nodejs-mongodb backend

The code is build with [Typescript](https://www.typescriptlang.org/)

#### Development

Locally:
`npm install && npm run build && npm local`

To get the code coverage:
`npm run coverage`

To run the tests in watch mode:
`npm run watch`

Precommits hooks using `husky` will run to check that the current work is acceptable for master:
- > Eslint / Tslint pass
- > 70% coverage with `nyc`