import supabase from 'lib/supabaseClient';
import { parse } from 'json2csv';

const objectFieldMap = {
    GuideAudio: ['Statut', 'Batterie', 'Trajet prévu', 'Audio en cours', 'Position actuelle', 'Dernier arrêt effectué'],
    CapteurClimat: ['État', 'Batterie', 'Affectation', 'Dernière syncro'],
    CompteurVisiteurs: ['Alerte', 'Humidité', 'Température', 'Dernière Mesure'],
    EclairageIntelligent: ['Nb actuel', 'Pic du jour', 'Capacité max'],
    AmbianceSonore: ['Mode', 'État', 'Allumé', 'Intensité', 'Présence détectée'],
    SerrureConnectee: ['Zone', 'Piste', 'Volume', 'Lecture'],
    CameraIntelligente: ['État', 'Dernier accès', 'Tentative refusée'],
    EtiquetteNFC: ['État', 'Connexion', 'Dernier mouvement'],
    PriseConnectee: ['Nb scans', 'Dernier scan', 'Lien accédé'],
    DetecteurFumee: ['État', 'Consommation', 'Programmation'],
    VitreElectrochrome: ['État', 'Dernier test', 'Niveau batterie'],
    TrainAutonome: ['Mode', 'État', 'Opacité']
};

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!id) {
        return res.status(400).json({ error: 'Missing object ID' });
    }

    // 1. Get the object type from ObjectData
    const { data: objectData, error: objectError } = await supabase
        .from('ObjectData')
        .select('type_Object')
        .eq('id', id)
        .single();

    if (objectError || !objectData?.type_Object) {
        return res.status(404).json({ error: 'ObjectData not found or missing type_Object', details: objectError?.message });
    }

    const type = objectData.type_Object;
    const fields = objectFieldMap[type];

    if (!fields) {
        return res.status(400).json({ error: `Unsupported object type: ${type}` });
    }

    // 2. Fetch historical data
    const { data: history, error: historyError } = await supabase
        .from('ObjectDataHistory')
        .select('old_data, updated_at, updatedBy')
        .eq('object_data_id', id)
        .order('updated_at', { ascending: true });

    if (historyError) {
        return res.status(500).json({ error: 'Error fetching history', details: historyError.message });
    }

    // 3. Format rows for CSV
    const rows = history.map(entry => {
        const row = {};
        fields.forEach(key => {
            row[key] = entry.old_data?.[key] ?? '';
        });
        row['updated_at'] = entry.updated_at;
        row['updatedBy'] = entry.updatedBy;
        return row;
    });

    const csv = parse(rows, { fields: [...fields, 'updated_at', 'updatedBy'], delimiter: ';' });

    // 4. Send CSV with headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=history_${type}_${id}.csv`);
    return res.status(200).send(csv);
}
