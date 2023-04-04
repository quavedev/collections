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

To use Schema options you need to install [meteor-collection2](https://github.com/Meteor-Community-Packages/meteor-collection2)

```sh
meteor add aldeed:collection2
meteor npm install simpl-schema
```

To use Helpers options you need to install [meteor-collection-helpers](https://github.com/dburles/meteor-collection-helpers)

```sh
meteor add dburles:collection-helpers
```

Check the documentation of each package to learn how to use them.

## Usage

### Methods

Example applying `collection` property:

```javascript
import { createCollection } from 'meteor/quave:collections';

export const AddressesCollection = createCollection({
  name: 'addresses',
  collection: {
    save(addressParam) {
      const address = { ...addressParam };

      if (address._id) {
        this.update(address._id, { $set: { ...address } });
        return address._id;
      }
      delete address._id;
      return this.insert({ ...address });
    },
  },
});
```

### Schema

Example applying `SimpleSchema`:

```javascript
import { createCollection } from 'meteor/quave:collections';

import SimpleSchema from 'simpl-schema';

const PlayerSchema = new SimpleSchema({
  name: {
    type: String,
  },
  age: {
    type: SimpleSchema.Integer,
  },
});

export const PlayersCollection = createCollection({
  name: 'players',
  schema: PlayerSchema,
});
```

### Composers

Example creating a way to paginate the fetch of data using `composers`

```javascript
import { createCollection } from 'meteor/quave:collections';

const LIMIT = 7;
export const paginable = collection =>
  Object.assign({}, collection, {
    getPaginated({ selector, options = {}, paginationAction }) {
      const { skip, limit } = paginationAction || { skip: 0, limit: LIMIT };
      const items = this.find(selector, {
        ...options,
        skip,
        limit,
      }).fetch();
      const total = this.find(selector).count();
      const nextSkip = skip + limit;
      const previousSkip = skip - limit;

      return {
        items,
        pagination: {
          total,
          totalPages: parseInt(total / limit, 10) + (total % limit > 0 ? 1 : 0),
          currentPage:
            parseInt(skip / limit, 10) + (skip % limit > 0 ? 1 : 0) + 1,
          ...(nextSkip < total ? { next: { skip: nextSkip, limit } } : {}),
          ...(previousSkip >= 0
            ? { previous: { skip: previousSkip, limit } }
            : {}),
        },
      };
    },
  });

export const StoresCollection = createCollection({
  name: 'stores',
  composers: [paginable],
});

// This probably will come from the client, using Methods, REST, or GraphQL
// const paginationAction = {skip: XXX, limit: YYY};

const { items, pagination } = StoresCollection.getPaginated({
  selector: {
    ...(search ? { name: { $regex: search, $options: 'i' } } : {}),
  },
  options: { sort: { updatedAt: -1 } },
  paginationAction,
});
```

A different example, a little bit more complex, overriding a few methods of the original collection in order to implement a soft removal (this example only works in `quave:collections@1.1.0` or later).

```javascript
import { createCollection } from 'meteor/quave:collections';

const toSelector = (filter) => {
  if (typeof filter === 'string') {
    return { _id: filter };
  }
  return filter;
};

const filterOptions = (options = {}) => {
  if (options.ignoreSoftRemoved) {
    return {};
  }
  return { isRemoved: { $ne: true } };
};

export const softRemoval = (collection) => {
  const originalFind = collection.find.bind(collection);
  const originalFindOne = collection.findOne.bind(collection);
  const originalUpdate = collection.update.bind(collection);
  const originalRemove = collection.remove.bind(collection);
  return Object.assign({}, collection, {
    find(selector, options) {
      return originalFind(
        {
          ...toSelector(selector),
          ...filterOptions(options),
        },
        options
      );
    },
    findOne(selector, options) {
      return originalFindOne(
        {
          ...toSelector(selector),
          ...filterOptions(options),
        },
        options
      );
    },
    remove(selector, options = {}) {
      if (options.hardRemove) {
        return originalRemove(selector);
      }
      return originalUpdate(
        {
          ...toSelector(selector),
        },
        {
          $set: {
            ...(options.$set || {}),
            isRemoved: true,
            removedAt: new Date(),
          },
        },
        { multi: true }
      );
    },
  });
};
export const SourcesCollection = createCollection({
  name: 'sources',
  composers: [softRemoval],
});

// usage example
SourcesCollection.remove({ _id: 'KEFemSmeZ9EpNfkcH' }); // this will use the soft removal, it means, this setting `isRemoved` to true
SourcesCollection.remove({ _id: 'KEFemSmeZ9EpNfkcH' }, { hardRemove: true }); // this will remove in the database

```

### Options
Second argument for the default [collections constructor](https://docs.meteor.com/api/collections.html#Mongo-Collection).
Example defining a transform function.
```javascript
const transform = doc => ({
  ...doc,
  get user() {
    return Meteor.users.findOne(this.userId);
  },
});

export const PlayersCollection = createCollection({
  name: 'players',
  schema,
  options: {
    transform,
  },
});
```

### Meteor.users

Extending Meteor.users, also using `collection`, `helpers`, `composers`, `apply`.

You can use all these options also with `name` instead of `instance`.

```javascript
import {createCollection} from 'meteor/quave:collections';

export const UsersCollection = createCollection({
  instance: Meteor.users,
  schema: UserTypeDef,
  collection: {
    isAdmin(userId) {
      const user = userId && this.findOne(userId, {fields: {profiles: 1}});
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
    coll.after.insert(userAfterInsert(coll), {fetchPrevious: false});
    coll.after.update(userAfterUpdate);
  },
});
```

## Limitations

- You can't apply `type` and `typeFields` when you inform an instance of a MongoDB collection, usually you only use an instance for `Meteor.users`. In this case I would recommend you to don't add fields with custom types to the users documents.

- If you want to use your objects from the database also in the client but you don't use your whole collection in client (you are not using Mini Mongo) you need to instantiate your type also in the client, you can do this importing your type and calling `register`. This is important to register it as an EJSON type.

### License

MIT
