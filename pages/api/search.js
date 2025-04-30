// pages/api/search.js
export default function handler(req, res) {
    const { q } = req.query;
    if (!q) return res.status(200).json([]);

    // Données fictives à remplacer plus tard par la BDD
    const objects = ["GuideAudio", "CapteurClimat", "AmbianceSonore", "DetecteurFumee", "PriseConnectee"];
    const rooms = ["Hall", "Salle 1", "Salle 2", "Salle 3", "Sculpture"];
    const users = ["deux", "me"];

    // Regroupe et filtre
    const filter = (list, label) =>
        list
            .filter(item => item.toLowerCase().includes(q.toLowerCase()))
            .map(item => ({ type: label, name: item }));

    const results = [
        ...filter(objects, "Objet"),
        ...filter(rooms, "Pièce"),
        ...filter(users, "Utilisateur")
    ];

    res.status(200).json(results);
}
