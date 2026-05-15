// Intentionally empty. n8n loads nodes via the `n8n` block in package.json
// (which points at compiled files in dist/). This file exists only so the
// `main` field in package.json resolves without error when consumers do a
// plain `require('n8n-nodes-amazonscraperapi')`.
module.exports = {};
