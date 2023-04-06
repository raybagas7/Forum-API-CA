exports.up = (pgm) => {
  pgm.addConstraint(
    'likes',
    'fk_likes.user_id_users.id',
    'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE',
  );

  pgm.addConstraint(
    'likes',
    'fk_likes.comment_id_comments.id',
    'FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint('likes', 'fk_likes.user_id_users.id');
  pgm.dropConstraint('likes', 'fk_likes.comment_id_comments.id');
};
