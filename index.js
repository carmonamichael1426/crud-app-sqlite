import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// SQLite database setup
const dbPath = path.resolve(__dirname, 'crud-app.sqlite');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, err => {
   if (err) {
      console.error('Database connection error:', err.message);
   } else {
      console.log('Connected to the SQLite database.');
      createTable(); // Ensure table creation on successful connection
   }
});

// Function to create 'items' table if not exists
function createTable() {
   db.run(
      `CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT
    )`,
      err => {
         if (err) {
            console.error('Table creation error:', err.message);
         } else {
            console.log('Table created successfully.');
         }
      },
   );
}

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
   db.all('SELECT * FROM items', (err, rows) => {
      if (err) {
         console.error('Database error:', err.message);
         res.status(500).send('Database error');
         return;
      }
      res.render('index', { items: rows });
   });
});

app.get('/item/add', (req, res) => {
   res.render('add');
});

app.post('/item/add', (req, res) => {
   const { name, description } = req.body;
   db.run('INSERT INTO items (name, description) VALUES (?, ?)', [name, description], err => {
      if (err) {
         console.error('Insert error:', err.message);
         res.status(500).send('Insert error');
         return;
      }
      res.redirect('/');
   });
});

app.get('/item/edit/:id', (req, res) => {
   const id = req.params.id;
   db.get('SELECT * FROM items WHERE id = ?', [id], (err, row) => {
      if (err) {
         console.error('Database error:', err.message);
         res.status(500).send('Database error');
         return;
      }
      if (!row) {
         res.status(404).send('Item not found');
         return;
      }
      res.render('edit', { item: row });
   });
});

app.post('/item/update/:id', (req, res) => {
   const id = req.params.id;
   const { name, description } = req.body;
   db.run('UPDATE items SET name = ?, description = ? WHERE id = ?', [name, description, id], err => {
      if (err) {
         console.error('Update error:', err.message);
         res.status(500).send('Update error');
         return;
      }
      res.redirect('/');
   });
});

app.post('/item/delete/:id', (req, res) => {
   const id = req.params.id;
   db.run('DELETE FROM items WHERE id = ?', [id], err => {
      if (err) {
         console.error('Delete error:', err.message);
         res.status(500).send('Delete error');
         return;
      }
      res.redirect('/');
   });
});

// Start server
app.listen(PORT, () => {
   console.log(`Server is running on http://localhost:${PORT}`);
});
