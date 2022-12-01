/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.addColumn('threads', {
    is_delete: {
      type: 'BOOLEAN',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('threads', 'is_delete');
};
