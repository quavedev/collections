Package.describe({
  name: 'quave:collections',
  version: '2.0.1',
  summary: 'Utility package to create Meteor collections in a standard way',
  git: 'https://github.com/quavedev/collections',
});

Npm.depends({
  'lodash.isempty': '4.4.0',
  'lodash.isequal': '4.5.0',
  'lodash.isobject': '3.0.2',
});

Package.onUse(function (api) {
  api.versionsFrom('3.0-beta.7');

  api.use([
    'ecmascript@0.16.7||0.16.8-beta300.7',
    'mongo@1.0.0||2.0.0||2.0.0-beta300.7',
    'minimongo@1.9.3||2.0.0-beta300.7',
    'ejson@1.1.3||1.1.4-beta300.7',
  ]);
  api.imply('mongo');

  api.use('raix:eventemitter@1.0.0');

  api.use('quave:settings@1.0.0');

  api.mainModule('collections.js');
});

Package.onTest(function (api) {
  api.use(['ecmascript@0.16.7||0.16.8-beta300.7', 'tinytest', 'insecure', 'autopublish', 'mongo@1.0.0||2.0.0||2.0.0-beta300.7']);

  api.addFiles(['helpers.js', 'helpers-test.js']);
});
