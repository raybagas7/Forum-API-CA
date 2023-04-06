exports.up = (pgm) => {
  pgm.createTable('likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    is_like: {
      type: 'BOOLEAN',
      default: 'true',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('likes');
};
