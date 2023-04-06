exports.up = (pgm) => {
  pgm.addConstraint(
    'likes',
    'multiple_unique.user_id.comment_id',
    'UNIQUE(user_id, comment_id)',
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint('likes', 'multiple_unique.user_id.comment_id');
};
