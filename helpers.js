Mongo.Collection.prototype.helpers = function (helpers) {
  const self = this;

  if (self._transform && !self._helpers) {
    throw new Meteor.Error(
      `Can't apply helpers to '${self._name}' a transform function already exists!`,
    );
  }

  if (!self._helpers) {
    self._helpers = function Document(doc) {
      return Object.assign(this, doc);
    };
    self._transform = (doc) => new self._helpers(doc);
  }

  Object.keys(helpers).forEach((key) => {
    self._helpers.prototype[key] = helpers[key];
  });
};
