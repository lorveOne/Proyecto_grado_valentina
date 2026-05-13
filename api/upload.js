import { put, list, del } from '@vercel/blob';

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED_PREFIXES = ['image/', 'video/', 'application/pdf', 'application/vnd', 'application/msword'];
const VALID_SLOTS = new Set(['ideas', 'protocolo']);

const slugify = (name) =>
    name
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase();

const isAllowedType = (type) => ALLOWED_PREFIXES.some((p) => type && type.startsWith(p));

const buildPathname = ({ slot, rawName }) => {
    const filename = slugify(decodeURIComponent(rawName));
    if (slot) return `materiales/_slots/${slot}__${filename}`;
    return `materiales/${Date.now()}-${filename}`;
};

const purgeSlot = async (slot, token) => {
    const { blobs } = await list({ prefix: `materiales/_slots/${slot}__`, token });
    await Promise.all(blobs.map((b) => del(b.url, { token })));
};

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const rawName = req.headers['x-filename'];
    const contentType = req.headers['content-type'] || 'application/octet-stream';
    const sizeHeader = req.headers['content-length'];
    const slot = req.query.slot;

    if (!rawName) {
        return res.status(400).json({ error: 'Missing X-Filename header' });
    }
    if (sizeHeader && Number(sizeHeader) > MAX_BYTES) {
        return res.status(413).json({ error: 'Archivo demasiado grande (máx. 25 MB)' });
    }
    if (!isAllowedType(contentType)) {
        return res.status(415).json({ error: 'Tipo de archivo no permitido' });
    }
    if (slot && !VALID_SLOTS.has(slot)) {
        return res.status(400).json({ error: 'Slot inválido' });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.pruebas_READ_WRITE_TOKEN;
    if (!token) {
        return res.status(500).json({ error: 'Token de Blob no configurado en el servidor' });
    }

    try {
        if (slot) await purgeSlot(slot, token);

        const pathname = buildPathname({ slot, rawName });
        const blob = await put(pathname, req, {
            access: 'public',
            contentType,
            token,
            addRandomSuffix: false,
        });

        return res.status(200).json({ ...blob, slot: slot || null });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Error al subir el archivo' });
    }
}
