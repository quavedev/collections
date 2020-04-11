import { EJSON } from 'meteor/ejson';

/* eslint-disable class-methods-use-this */
export class TypeDef {
  constructor() {
    this.register();
  }

  register() {
    // Type is already present
    if (!EJSON._getTypes()[this.name()]) {
      EJSON.addType(this.name(), json => this.fromJSONValue(json));
    }
  }

  name() {
    throw new Error('name');
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
