Package.describe({
  name: 'quave:collections',
  version: '0.0.2',
  summary: 'Utility package to create Meteor collections in a standard way',
  git: 'https://github.com/quavedev/collections',
});

Package.onUse(function(api) {
  api.versionsFrom('1.10.1');
  api.use('ecmascript');
  api.mainModule('collections.js');
});
