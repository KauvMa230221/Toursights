const express = require('express');
const path = require('path');
const app = express();

// This tells the server to serve all your HTML/CSS/JS files
app.use(express.static(path.join(__dirname, '/')));

// This handles the main route
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Use Render's port or default to 3000
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});