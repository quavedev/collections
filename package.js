Package.describe({
  name: 'quave:collections',
  version: '1.0.2',
  summary: 'Utility package to create Meteor collections in a standard way',
  git: 'https://github.com/quavedev/collections',
});

Package.onUse(function(api) {
  api.versionsFrom('1.10.2');

  api.use('ecmascript');

  api.use('mongo');
  api.use('ejson');

  api.use('quave:settings@1.0.0');

  api.mainModule('collections.js');
});
