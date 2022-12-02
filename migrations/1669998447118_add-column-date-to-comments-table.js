/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.addColumn('comments', {
    date: {
      type: 'TEXT',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('comments', 'date');
};
