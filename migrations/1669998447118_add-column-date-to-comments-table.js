/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.addColumn('comments', {
    date: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('comments', 'date');
};
