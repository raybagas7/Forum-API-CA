exports.up = (pgm) => {
  pgm.addConstraint(
    'replies',
    'fk_replies.owner_users.id',
    'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE',
  );

  pgm.addConstraint(
    'replies',
    'fk_replies.thread_id_threads.id',
    'FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE',
  );

  pgm.addConstraint(
    'replies',
    'fk_replies.comment_id_comments.id',
    'FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint('replies', 'fk_replies.owner_users.id');
  pgm.dropConstraint('replies', 'fk_replies.thread_id_threads.id');
  pgm.dropConstraint('replies', 'fk_replies.comment_id_comments.id');
};
