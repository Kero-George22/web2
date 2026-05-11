const fs = require('fs');

let c = fs.readFileSync('client/src/pages/MovieDetailPage.jsx', 'utf8');

c = c.replace('onDeleteComment={handleDeleteReviewComment}', 'onDeleteComment={handleDeleteReviewComment}\n                    onDeleteReview={handleDeleteReview}');

c = c.replace('function ReviewCard({ review, onToggleLike, onAddComment, onDeleteComment })', 'function ReviewCard({ review, onToggleLike, onAddComment, onDeleteComment, onDeleteReview })');

const dr = `
  const handleDeleteReview = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await onDeleteReview(review._id);
    } catch (err) {
      toast(err.message, 'error');
    }
  };
`;

c = c.replace(/(const handleDeleteComment = async \(commentId\) => \{[\s\S]*?catch \(err\) \{[\s\S]*?toast\(err\.message, 'error'\);[\s\S]*?\}[\s\S]*?\};)/, match => match + '\n' + dr);

c = c.replace('<span className="text-cinema-muted text-xs ml-auto">{date}</span>', '<span className="text-cinema-muted text-xs ml-auto">{date}</span>\n            {authUser && (authUser.isAdmin || authUser._id === user?._id) && (<button onClick={handleDeleteReview} className="text-xs text-red-500 hover:text-red-400 ml-2">Delete Review</button>)}');

c = c.replace("const handleDeleteComment = async (commentId) => {\n    try {", "const handleDeleteComment = async (commentId) => {\n    if (!window.confirm('Are you sure you want to delete this comment?')) return;\n    try {");

fs.writeFileSync('client/src/pages/MovieDetailPage.jsx', c);
