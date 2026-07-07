const { neon } = require('@neondatabase/serverless');

module.exports = async (req, res) => {
  const sql = neon(process.env.DATABASE_URL);

  // GET — tüm işleri çek
  if (req.method === 'GET') {
    try {
      const rows = await sql`SELECT id, kategori_kodu, is_adi FROM works ORDER BY created_at ASC`;
      const grouped = {};
      for (const row of rows) {
        if (!grouped[row.kategori_kodu]) grouped[row.kategori_kodu] = [];
        grouped[row.kategori_kodu].push({ id: row.id, val: row.is_adi });
      }
      res.status(200).json(grouped);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  // POST — yeni iş ekle
  if (req.method === 'POST') {
    try {
      const { kategori_kodu, is_adi } = req.body;
      if (!kategori_kodu || !is_adi) {
        res.status(400).json({ error: 'kategori_kodu ve is_adi gerekli' });
        return;
      }
      const result = await sql`INSERT INTO works (kategori_kodu, is_adi) VALUES (${kategori_kodu}, ${is_adi}) RETURNING id`;
      res.status(200).json({ status: 'ok', id: result[0].id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  // PUT — iş güncelle
  if (req.method === 'PUT') {
    try {
      const { id, is_adi } = req.body;
      if (!id || !is_adi) {
        res.status(400).json({ error: 'id ve is_adi gerekli' });
        return;
      }
      await sql`UPDATE works SET is_adi = ${is_adi} WHERE id = ${id}`;
      res.status(200).json({ status: 'ok' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  // DELETE — iş sil
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      if (!id) {
        res.status(400).json({ error: 'id gerekli' });
        return;
      }
      await sql`DELETE FROM works WHERE id = ${id}`;
      res.status(200).json({ status: 'ok' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
