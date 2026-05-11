const fs = require('fs');
let c = fs.readFileSync('client/src/pages/MovieDetailPage.jsx', 'utf8');

c = c.replace(/const handleDeleteReview = async \(\) => \{\s*if \(\!window.confirm\('Are you sure you want to delete this review\?'\)\) return;\s*try \{\s*await onDeleteReview\(review\._id\);\s*\} catch \(err\) \{\s*toast\(err.message, 'error'\);\s*\}\s*\};\s*const handleDeleteReview = async \(\) => \{\s*if \(\!window\.confirm\('Are you sure you want to delete this review\?'\)\) return;\s*try \{\s*await onDeleteReview\(review\._id\);\s*\} catch \(err\) \{\s*toast\(err\.message, 'error'\);\s*\}\s*\};/, `const handleDeleteReview = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await onDeleteReview(review._id);
    } catch (err) {
      toast(err.message, 'error');
    }
  };`);

fs.writeFileSync('client/src/pages/MovieDetailPage.jsx', c);
