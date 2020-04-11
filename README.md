# quave:collections

`quave:collections` is a Meteor package that allows you to create your collections in a standard way.

Features
  - Schemas
  - Types
  - Helpers
  - Hooks
  - Composers
  
## Why
Every application that connects to databases usually need the following features:
- A way to access object instances when they come from the database: helpers
- Provide new methods to collections: collection
- Add a few hooks to react to changes in different collections: hooks
- Map some types to avoid manual conversion all the time: types
- Valid the data before persisting: schemas
- Centralize behaviors: composers

Meteor has packages for almost all these use cases but it's not easy to find the best in each case and also how to use them together, that is why we have created this package.
 
We offer here a standard way for you to create your collections by configuring all these features in a function call `createCollection` using a bunch of options in a declarative way and without using Javascript classes. 

We also allow you to extend your `Meteor.users` collection in the same way as any other collection.

We believe we are not reinventing the wheel in this package but what we are doing is like putting together the wheels in the vehicle :).
  
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


## Usage

### Meteor.users

```javascript
export const UsersCollection = createCollection({
  instance: Meteor.users,
  schema: UserSchema,
  collection: {
    isAdmin(userId) {
      const user = userId && this.findOne(userId, { fields: { profiles: 1 } });
      return (
        user && user.profiles && user.profiles.includes(UserProfile.ADMIN.name)
      );
    },
  },
  helpers: {
    toPaymentGatewayJson() {
      return {
        country: 'us',
        external_id: this._id,
        name: this.name,
        type: 'individual',
        email: this.email,
      };
    },
  },
  composers: [paginable],
  apply(coll) {
    coll.after.insert(userAfterInsert(coll), { fetchPrevious: false });
    coll.after.update(userAfterUpdate);
  },
});
```

## Limitations

- You can't apply `type` and `typeFields` when you inform an instance of a MongoDB collection, usually you only use an instance for `Meteor.users`. In this case I would recommend you to don't add fields with custom types to the users documents.

- If you want to use your objects from the database also in the client but you don't use your whole collection in client (you are not using Mini Mongo) you need to instantiate your type also in the client, you can do this importing your type and calling `register`. This is important to register it as an EJSON type.

### License

MIT
