/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.addColumn('comments', {
    is_delete: {
      type: 'BOOLEAN',
      default: 'false',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('comments', 'is_delete');
};
