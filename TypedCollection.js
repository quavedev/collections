import { Mongo } from 'meteor/mongo';
import { EJSON } from 'meteor/ejson';

const PREFIX_PATH_TO_MARK = '$$pathTo-';
export const pathTo = path => `${PREFIX_PATH_TO_MARK}${path}`;

const MapperFunc = mappers => ({
  ofType(rootType) {
    const mapper = mappers[rootType];
    if (!mapper) {
      throw new Error(
        `Typed fields were not found for "${rootType}", maybe you forgot to pass the option "typeFields" or is it incomplete? Your typeFields is ${JSON.stringify(
          mappers || {}
        )}`
      );
    }
    return mapper;
  },
  isSubtype(type, path) {
    const value = this.ofType(type)[path];
    return (
      typeof value === 'string' && value.indexOf(PREFIX_PATH_TO_MARK) === 0
    );
  },
  getSubtype(type, path) {
    const value = this.ofType(type)[path];
    return value.substr(PREFIX_PATH_TO_MARK.length);
  },
});

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

const TypedFunc = mappers => {
  const mapperFunc = MapperFunc(mappers);
  return {
    lookForTypesAndApply(rootType, obj, consumeType) {
      if (obj) {
        const transformer = mapperFunc.ofType(rootType);

        Object.entries(transformer).forEach(([key, value]) => {
          if (!(key in obj)) {
            return;
          }
          if (!mapperFunc.isSubtype(rootType, key)) {
            if (Array.isArray(value)) {
              // eslint-disable-next-line no-param-reassign
              obj[key] = obj[key].map(v => consumeType(value[0], v));
            } else {
              // eslint-disable-next-line no-param-reassign
              obj[key] = consumeType(value, obj[key]);
            }
          } else {
            const subtype = mapperFunc.getSubtype(rootType, key);
            const arr = Array.isArray(obj[key]) ? obj[key] : [obj[key]];
            const newArr = [];
            for (let i = 0; i < arr.length; i++) {
              const v = { ...arr[i] };
              newArr.push(v);
              this.lookForTypesAndApply(subtype, v, consumeType);
            }
            // eslint-disable-next-line no-param-reassign
            obj[key] = Array.isArray(obj[key]) ? newArr : newArr[0];
          }
        });
      }
      return obj;
    },
    onPersistCollection(rootType, obj) {
      return this.lookForTypesAndApply(rootType, obj, (parser, value) =>
        parser.toPersist(value)
      );
    },
    onLoadFromCollection(rootType, obj) {
      return this.lookForTypesAndApply(rootType, obj, (parser, value) =>
        parser.fromPersisted(value)
      );
    },
  };
};

export const TypedCollection = {
  createTypedCollection: (name, rootType, opts) => {
    const typedFunc = TypedFunc((opts || {}).typeFields || {});
    const collection = new Mongo.Collection(name, {
      transform: obj => typedFunc.onLoadFromCollection(rootType, obj),
    });
    if (!collection.before) {
      console.warn(
        'If you want to automatically convert your types before persisting on MongoDB please add this package https://github.com/Meteor-Community-Packages/meteor-collection-hooks'
      );
    } else {
      // registerHooks
      collection.before.insert((_, obj) => {
        typedFunc.onPersistCollection(rootType, obj);
      });
      collection.before.update((userId, doc, fields, set) => {
        typedFunc.onPersistCollection(rootType, set.$set);
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
