import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import { getSettings } from 'meteor/quave:settings';

import { TypedCollection } from './TypedCollection';

const PACKAGE_NAME = 'quave:collections';
const settings = getSettings({ packageName: PACKAGE_NAME });

const { isServerOnly, isVerbose } = settings;

/**
 * Copied from recompose https://github.com/acdlite/recompose/blob/master/src/packages/recompose/compose.js#L1
 * @param funcs
 * @returns {*|(function(*): *)}
 */
const compose = (...funcs) =>
  funcs.reduce(
    (a, b) => (...args) => a(b(...args)),
    arg => arg
  );

const getDbCollection = ({ name, definition, helpers, instance }) => {
  if (definition) {
    if (instance) {
      throw new Error("dbCollection is already defined, type can't be applied");
    }

    return TypedCollection.createTypedCollection(name, definition, {
      helpers,
    });
  }
  let dbCollection = instance;
  if (!dbCollection) {
    dbCollection = new Mongo.Collection(name);
  }
  if (helpers && Object.keys(helpers).length) {
    if (!dbCollection.helpers) {
      throw new Error(
        "You need to add this package https://github.com/dburles/meteor-collection-helpers to use 'helpers'"
      );
    }
    dbCollection.helpers(helpers);
  }
  return dbCollection;
};

export const createCollection = ({
  name,
  definition,
  schema,
  collection = {},
  helpers = {},
  apply = null,
  composers = [],
  instance = null,
}) => {
  try {
    if (isVerbose) {
      console.log(`${PACKAGE_NAME} ${name} settings`, settings);
    }

    if (!name && !instance) {
      throw new Error(
        "The option 'name' is required, unless you are using the option 'instance' that is not your case :)."
      );
    }
    if (Meteor.isClient && isServerOnly) {
      throw new Error(
        'Collections are not allowed in the client, you can disable this changing the setting `isServerOnly`'
      );
    }
    const dbCollection = getDbCollection({
      name,
      definition,
      helpers,
      instance,
    });

    if (apply) {
      apply(dbCollection);
    }

    Object.assign(dbCollection, compose(...composers)(collection));

    if (schema) {
      if (!dbCollection.attachSchema) {
        throw new Error(
          "attachSchema function is not present in your collection so you can't use 'schema' option, use https://github.com/Meteor-Community-Packages/meteor-collection2 if you want to have it."
        );
      }
      dbCollection.attachSchema(schema);
    }
    return dbCollection;
  } catch (e) {
    console.error(
      `An error has happened when your collection${
        name ? ` "${name}"` : ''
      } was being created.`,
      e
    );
    throw e;
  }
};
