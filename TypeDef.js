import { EJSON } from 'meteor/ejson';

import { getSettings } from 'meteor/quave:settings';

const PACKAGE_NAME = 'quave:collections';
const settings = getSettings({ packageName: PACKAGE_NAME });

const { isVerbose } = settings;

/* eslint-disable class-methods-use-this */
export class TypeDef {
  constructor() {
    this.register();
  }

  register() {
    // Type is already present
    if (!EJSON._getTypes()[this.name()]) {
      if (isVerbose) {
        console.log(
          `${PACKAGE_NAME} EJSON.addType ${this.name()} from TypeDef class`
        );
      }
      EJSON.addType(this.name(), json => this.fromJSONValue(json));
    }
  }

  name() {
    throw new Error(
      `name() needs to be implemented in ${this.constructor.name}`
    );
  }

  description() {
    return '';
  }

  fromJSONValue(json) {
    return json;
  }

  toPersist(obj) {
    if (obj !== undefined && obj !== null) {
      return this.doToPersist(obj);
    }
    return obj;
  }

  fromPersisted(obj) {
    if (obj !== undefined && obj !== null) {
      return this.doFromPersisted(obj);
    }
    return obj;
  }

  doToPersist(obj) {
    throw new Error(obj);
  }

  doFromPersisted(obj) {
    return obj;
  }

  doParseLiteral(ast) {
    if (ast.kind === 'IntValue') {
      const result = parseInt(ast.value, 10);
      return this.doFromPersisted(result); // ast value is always in string format
    }
    return null;
  }
}
