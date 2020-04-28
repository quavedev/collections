import { Mongo } from 'meteor/mongo';
import { EJSON } from 'meteor/ejson';

import { getSettings } from 'meteor/quave:settings';

const PACKAGE_NAME = 'quave:collections';
const settings = getSettings({ packageName: PACKAGE_NAME });

const { isVerbose } = settings;

export const Types = {
  scalarAndEjson(type) {
    return {
      name: type.name(),
      description: type.description(),
      serialize: obj => obj,
      parseValue: obj => obj,
    };
  },
};

const lookForTypesAndApply = (definition, obj, consumeType) => {
  if (obj) {
    Object.entries(definition.fields).forEach(([key, value]) => {
      if (!(key in obj)) {
        return;
      }
      if (!EJSON._getTypes()[value.typeName]) {
        return;
      }

      // is not a subtype
      if (!value.fields) {
        if (Array.isArray(value)) {
          // eslint-disable-next-line no-param-reassign
          obj[key] = obj[key].map(v => consumeType(value[0].customType, v));
        } else {
          // eslint-disable-next-line no-param-reassign
          obj[key] = consumeType(value.customType, obj[key]);
        }
      } else {
        const subtype = value;
        const arr = Array.isArray(obj[key]) ? obj[key] : [obj[key]];
        const newArr = [];
        for (let i = 0; i < arr.length; i++) {
          const v = { ...arr[i] };
          newArr.push(v);
          lookForTypesAndApply(subtype, v, consumeType);
        }
        // eslint-disable-next-line no-param-reassign
        obj[key] = Array.isArray(obj[key]) ? newArr : newArr[0];
      }
    });
  }
  return obj;
};

const onPersistCollection = (definition, obj) => {
  return lookForTypesAndApply(definition, obj, (parser, value) => {
    return parser.toPersist(value);
  });
};

const onLoadFromCollection = (definition, obj) =>
  lookForTypesAndApply(definition, obj, (parser, value) =>
    parser.fromPersisted(value)
  );

export const TypedCollection = {
  createTypedCollection: (name, definition, opts) => {
    if (!definition) {
      throw new Error(`"definition" option was not found for "${name}"`);
    }
    const collection = new Mongo.Collection(name, {
      transform: obj => onLoadFromCollection(definition, obj),
    });
    if (!collection.before) {
      console.warn(
        'If you want to automatically convert your types before persisting on MongoDB please add this package https://github.com/Meteor-Community-Packages/meteor-collection-hooks'
      );
    } else {
      // registerHooks
      collection.before.insert((_, obj) => {
        onPersistCollection(definition, obj);
      });
      collection.before.update((userId, doc, fields, set) => {
        onPersistCollection(definition, set.$set);
      });
    }

    if (opts && opts.helpers && Object.keys(opts.helpers).length) {
      // :-( private access
      const transformType = collection._transform;
      collection._transform = null;
      if (!collection.helpers) {
        throw new Error(
          "You need to add this package https://github.com/dburles/meteor-collection-helpers to use 'helpers'"
        );
      }
      collection.helpers(opts.helpers);
      const transformHelpers = collection._transform;

      collection._transform = doc => transformType(transformHelpers(doc));
    }
    return collection;
  },
};
