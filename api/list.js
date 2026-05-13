import { list } from '@vercel/blob';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.pruebas_READ_WRITE_TOKEN;
    if (!token) {
        return res.status(500).json({ error: 'Token de Blob no configurado en el servidor' });
    }

    try {
        const result = await list({ prefix: 'materiales/', token });
        const blobs = (result.blobs || [])
            .filter((b) => !b.pathname.startsWith('materiales/_slots/'))
            .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        return res.status(200).json({ blobs });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Error al listar archivos' });
    }
}
