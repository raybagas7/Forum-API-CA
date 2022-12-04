/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.addColumn('replies', {
    is_delete: {
      type: 'BOOLEAN',
      default: 'false',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('replies', 'is_delete');
};
