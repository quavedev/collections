import { Mongo } from 'meteor/mongo';

const options = { _suppressSameNameError: true };
Tinytest.addAsync('works', async function (test) {
  const Books = new Mongo.Collection(`books`, options);
  const Authors = new Mongo.Collection(`authors`, options);

  const author1 = await Authors.insertAsync({
    firstName: 'Charles',
    lastName: 'Darwin',
  });

  const author2 = await Authors.insertAsync({
    firstName: 'Carl',
    lastName: 'Sagan',
  });

  const book1 = await Books.insertAsync({
    authorId: author1,
    name: 'On the Origin of Species',
  });

  const book2 = await Books.insertAsync({
    authorId: author2,
    name: 'Contact',
  });

  Books.helpers({
    author: async function () {
      return Authors.findOneAsync(this.authorId);
    },
  });

  // We should be able to apply more if we wish
  Books.helpers({
    foo: 'bar',
  });

  Authors.helpers({
    fullName: function () {
      return `${this.firstName} ${this.lastName}`;
    },
    books: function () {
      return Books.find({ authorId: this._id });
    },
  });

  const bookFirst = await Books.findOneAsync(book1);
  const authorFirst = await bookFirst?.author();

  test.equal(authorFirst?.firstName, 'Charles');
  test.equal(bookFirst?.foo, 'bar');

  const bookSecond = await Books.findOneAsync(book2);
  const authorSecond = await bookSecond?.author();
  test.equal(authorSecond?.fullName(), 'Carl Sagan');

  const authorThird = await Authors.findOneAsync(author1);
  const booksThird = await authorThird?.books();
  test.equal(await booksThird?.countAsync(), 1);
});

Tinytest.addAsync(
  'throw error if transform function already exists',
  async function (test) {
    const Author = function (doc) {
      return Object.assign(this, doc);
    };

    Author.prototype.fullName = 'Charles Darwin';

    const Authors = new Mongo.Collection(`authors`, {
      ...options,
      transform: function (doc) {
        return new Author(doc);
      },
    });

    test.throws(function () {
      Authors.helpers({
        fullName: function () {
          return `${this.firstName} ${this.lastName}`;
        },
      });
    });
  }
);
