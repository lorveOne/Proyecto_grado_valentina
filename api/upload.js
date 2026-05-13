import { put } from '@vercel/blob';

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED_PREFIXES = ['image/', 'video/', 'application/pdf', 'application/vnd', 'application/msword'];

const slugify = (name) =>
    name
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase();

const isAllowedType = (type) => ALLOWED_PREFIXES.some((p) => type && type.startsWith(p));

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const rawName = req.headers['x-filename'];
    const contentType = req.headers['content-type'] || 'application/octet-stream';
    const sizeHeader = req.headers['content-length'];

    if (!rawName) {
        return res.status(400).json({ error: 'Missing X-Filename header' });
    }
    if (sizeHeader && Number(sizeHeader) > MAX_BYTES) {
        return res.status(413).json({ error: 'Archivo demasiado grande (máx. 25 MB)' });
    }
    if (!isAllowedType(contentType)) {
        return res.status(415).json({ error: 'Tipo de archivo no permitido' });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.pruebas_READ_WRITE_TOKEN;
    if (!token) {
        return res.status(500).json({ error: 'Token de Blob no configurado en el servidor' });
    }

    const filename = `${Date.now()}-${slugify(decodeURIComponent(rawName))}`;
    const pathname = `materiales/${filename}`;

    try {
        const blob = await put(pathname, req, {
            access: 'public',
            contentType,
            token,
        });
        return res.status(200).json(blob);
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Error al subir el archivo' });
    }
}
