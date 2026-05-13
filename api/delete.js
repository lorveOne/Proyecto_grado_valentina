import { del } from '@vercel/blob';

export default async function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const url = req.query.url || (req.body && req.body.url);
    if (!url || !url.startsWith('https://')) {
        return res.status(400).json({ error: 'URL del archivo requerida' });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.pruebas_READ_WRITE_TOKEN;
    if (!token) {
        return res.status(500).json({ error: 'Token de Blob no configurado en el servidor' });
    }

    try {
        await del(url, { token });
        return res.status(200).json({ ok: true });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Error al eliminar el archivo' });
    }
}
