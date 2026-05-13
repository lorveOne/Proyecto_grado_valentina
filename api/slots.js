import { list } from '@vercel/blob';

const SLOTS = ['ideas', 'protocolo'];

const pickSlot = (blobs, slot) => {
    const prefix = `materiales/_slots/${slot}__`;
    const match = blobs.find((b) => b.pathname.startsWith(prefix));
    if (!match) return null;
    return {
        ...match,
        originalName: match.pathname.slice(prefix.length),
    };
};

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.pruebas_READ_WRITE_TOKEN;
    if (!token) {
        return res.status(500).json({ error: 'Token de Blob no configurado en el servidor' });
    }

    try {
        const { blobs } = await list({ prefix: 'materiales/_slots/', token });
        const slots = SLOTS.reduce((acc, slot) => {
            acc[slot] = pickSlot(blobs || [], slot);
            return acc;
        }, {});
        return res.status(200).json({ slots });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Error al cargar slots' });
    }
}
