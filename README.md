# quave:collections

`quave:collections` is a Meteor package that allows you to create your collections in a standard way.

Features
  - Schemas
  - Types
  - Helpers
  - Hooks
  - Composers
  
## Installation

```sh
meteor add quave:collections
```

### Optional installations

To use Type or Hooks options you need to install [meteor-collection-hooks](https://github.com/Meteor-Community-Packages/meteor-collection-hooks)

```sh
meteor add matb33:collection-hooks
```

To use Schema options you need to install [meteor-collection2](
https://github.com/Meteor-Community-Packages/meteor-collection2)
```sh
meteor add aldeed:collection2@3.0.0
meteor npm install --save simpl-schema
```

To use Helpers options you need to install [meteor-collection-helpers](https://github.com/dburles/meteor-collection-helpers)

```sh
meteor add dburles:collection-helpers
```

Check the documentation of each package to learn how to use them.

## Why
Every application connection to databases usually need the same features:
- A way to access object instances when they come from the database: helpers
- Provide new methods to collections: collection
- Add a few hooks to react to changes in different collections: hooks
- Map some types to avoid manual conversion all the time: types
- Valid the data before persisting: schemas
- Centralize behaviors: composers

Meteor has packages for almost all these use cases but this package offers you a standard way to create your collections adding all these features in a declarative way and without using Javascript classes. We also allow you to extend your `Meteor.users` collection in the same way as any other collection.

We are not reinventing the wheel, we are mounting the wheels in the vehicle :).

## Usage

## Limitations

- You can't apply `type` and `typeFields` when you inform an instance of a MongoDB collection, usually you only use an instance for `Meteor.users`. In this case I would recommend you to don't add fields with custom types to the users documents.

- If you want to use your objects from the database also in the client but you don't use your whole collection in client (you are not using Mini Mongo) you need to instantiate your type also in the client, you can do this importing your type and calling `register`. This is important to register it as an EJSON type.

### License

MIT
