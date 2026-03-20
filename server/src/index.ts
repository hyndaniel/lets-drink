import express from 'express';
import cors from 'cors';
import multer from 'multer';
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const heicConvert = require('heic-convert') as (opts: { buffer: ArrayBuffer; format: 'JPEG' | 'PNG'; quality: number }) => Promise<ArrayBuffer>;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database Setup
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}
const db = new sqlite3.Database(path.join(dataDir, 'database.sqlite'));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS records (
      id TEXT PRIMARY KEY,
      date TEXT,
      location TEXT,
      people TEXT,
      alcoholAmount TEXT,
      stateToday TEXT,
      stateTomorrow TEXT,
      notes TEXT,
      media TEXT
    )
  `);

  db.all("PRAGMA table_info(records);", (err, rows: any[]) => {
    if (err) return;
    const hasNotes = rows.some((r: any) => r.name === 'notes');
    if (!hasNotes) {
      db.run("ALTER TABLE records ADD COLUMN notes TEXT");
    }
    const hasGatheringType = rows.some((r: any) => r.name === 'gatheringType');
    if (!hasGatheringType) {
      db.run("ALTER TABLE records ADD COLUMN gatheringType TEXT DEFAULT 'friends'");
    }
  });
});

// Multer Setup for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});
const upload = multer({ storage });

// Convert HEIC to JPEG using heic-convert (pure JS, handles iPhone Pro HEIC correctly)
const convertHeicIfNeeded = async (file: Express.Multer.File): Promise<{ filename: string; mimetype: string }> => {
  const isHeic = file.mimetype === 'image/heic' || file.mimetype === 'image/heif'
    || file.originalname.toLowerCase().endsWith('.heic')
    || file.originalname.toLowerCase().endsWith('.heif');

  if (!isHeic) return { filename: file.filename, mimetype: file.mimetype };

  const inputPath = path.join(__dirname, '../uploads', file.filename);
  const outputFilename = `${path.basename(file.filename, path.extname(file.filename))}.jpg`;
  const outputPath = path.join(__dirname, '../uploads', outputFilename);

  console.log(`[HEIC] Converting: ${file.originalname} -> ${outputFilename}`);

  try {
    const inputBuffer = fs.readFileSync(inputPath);
    const outputBuffer = await heicConvert({
      buffer: inputBuffer as unknown as ArrayBuffer,
      format: 'JPEG',
      quality: 0.92
    });
    fs.writeFileSync(outputPath, Buffer.from(outputBuffer));
    fs.unlinkSync(inputPath);
    console.log(`[HEIC] Conversion success -> ${outputFilename}`);
    return { filename: outputFilename, mimetype: 'image/jpeg' };
  } catch (e: any) {
    console.error('[HEIC] Conversion failed:', e?.message || e);
    return { filename: file.filename, mimetype: file.mimetype };
  }
};

// API Routes

// GET all records
app.get('/api/records', (req, res) => {
  db.all('SELECT * FROM records ORDER BY date DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const records = rows.map((row: any) => ({
      ...row,
      people: JSON.parse(row.people),
      media: JSON.parse(row.media)
    }));
    res.json(records);
  });
});

// POST or PUT record (Upsert logic via SQLite ON CONFLICT)
app.post('/api/records', upload.array('files'), async (req, res) => {
  try {
    const recordData = JSON.parse(req.body.record);
    const files = req.files as Express.Multer.File[];

    const existingMedia = recordData.media || [];

    const newMediaItems = await Promise.all(files.map(async f => {
      const converted = await convertHeicIfNeeded(f);
      return {
        id: uuidv4(),
        name: f.originalname.replace(/\.(heic|heif)$/i, '.jpg'),
        type: converted.mimetype,
        url: `/uploads/${converted.filename}`
      };
    }));

    const finalMedia = [...existingMedia, ...newMediaItems];

    const stmt = db.prepare(`
      INSERT INTO records (id, date, location, people, alcoholAmount, notes, gatheringType, stateToday, stateTomorrow, media)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        date=excluded.date,
        location=excluded.location,
        people=excluded.people,
        alcoholAmount=excluded.alcoholAmount,
        notes=excluded.notes,
        gatheringType=excluded.gatheringType,
        stateToday=excluded.stateToday,
        stateTomorrow=excluded.stateTomorrow,
        media=excluded.media
    `);

    stmt.run(
      recordData.id,
      recordData.date,
      recordData.location,
      JSON.stringify(recordData.people),
      recordData.alcoholAmount,
      recordData.notes || '',
      recordData.gatheringType || 'friends',
      recordData.stateToday,
      recordData.stateTomorrow,
      JSON.stringify(finalMedia),
      function(err: Error | null) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: recordData.id });
      }
    );
    stmt.finalize();

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
