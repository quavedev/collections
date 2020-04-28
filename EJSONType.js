/* eslint-disable class-methods-use-this */
export class EJSONType {
  typeName() {
    return this.constructor.name;
  }

  toJSONValue() {
    throw new Error(
      `toJSONValue() needs to be implemented in ${this.typeName()}`
    );
  }
}
