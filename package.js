Package.describe({
  name: 'quave:collections',
  version: '1.1.0',
  summary: 'Utility package to create Meteor collections in a standard way',
  git: 'https://github.com/quavedev/collections',
});

Npm.depends({
  'lodash.isempty': '4.4.0',
  'lodash.isequal': '4.5.0',
  'lodash.isobject': '3.0.2',
});

Package.onUse(function(api) {
  api.versionsFrom('2.13.3');

  api.use('mongo');
  api.imply('mongo');
  api.use('minimongo');
  api.use('ejson');
  api.use('raix:eventemitter@1.0.0');
  api.use('ecmascript');
  api.use('tmeasday:check-npm-versions@1.0.2');
  api.use('quave:settings@1.0.0');

  api.mainModule('collections.js');

  api.export('Collection2');
});
