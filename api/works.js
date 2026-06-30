const { neon } = require('@neondatabase/serverless');

module.exports = async (req, res) => {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'GET') {
    try {
      const rows = await sql`SELECT kategori_kodu, is_adi FROM works ORDER BY created_at ASC`;
      const grouped = {};
      for (const row of rows) {
        if (!grouped[row.kategori_kodu]) grouped[row.kategori_kodu] = [];
        grouped[row.kategori_kodu].push(row.is_adi);
      }
      res.status(200).json(grouped);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const { kategori_kodu, is_adi } = req.body;
      if (!kategori_kodu || !is_adi) {
        res.status(400).json({ error: 'kategori_kodu ve is_adi gerekli' });
        return;
      }
      await sql`INSERT INTO works (kategori_kodu, is_adi) VALUES (${kategori_kodu}, ${is_adi})`;
      res.status(200).json({ status: 'ok' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
