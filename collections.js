import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import { getSettings } from 'meteor/quave:settings';

import { CustomTypeCollection } from './CustomTypeCollection';

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

const getDbCollection = ({ name, definition, helpers, instance, options }) => {
  if (definition) {
    if (instance) {
      throw new Error("dbCollection is already defined, type can't be applied");
    }

    return CustomTypeCollection.createTypedCollection(name, definition, {
      helpers,
    });
  }
  let dbCollection = instance;
  if (!dbCollection) {
    dbCollection = new Mongo.Collection(name, options);
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
  definition,
  name: nameParam,
  schema: schemaParam,
  collection = {},
  helpers = {},
  apply = null,
  composers = [],
  instance = null,
  options = {},
}) => {
  try {

    const schema = definition ? definition.toSimpleSchema() : schemaParam;
    const name = definition ? definition.pluralNameCamelCase : nameParam;
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
      options,
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
    dbCollection.definition = definition;
    return dbCollection;
  } catch (e) {
    console.error(
      `An error has happened when your collection${
        nameParam ? ` "${nameParam}"` : ''
      } was being created.`,
      e
    );
    throw e;
  }
};
