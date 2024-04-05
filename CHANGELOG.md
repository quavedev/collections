## CHANGELOG

### 2.0.1 (2023-03-22)

- Fixes `Exception running scheduled job TypeError: context.invalidKeys is not a function`
- Removes `import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';` due to old typescript dependency

### 2.0.0 (2023-11-15)

- Compatible with Meteor 3.0 (hooks and helpers are still not supported tho)
- Removes `definition` option (and types) 

### 1.1.0 (2023-03-13)

- Composer now receives the collection object from Meteor already assigned to the `collection` property. Before it was getting only the collection property.
