export default function objectDataFields(objectType) {
	switch (objectType) {
		case 'VitreElectrochrome':
			return ['État', 'Dernier test', 'Niveau batterie'];
		case 'CapteurClimat':
			return ['État', 'Batterie', 'Affectation', 'Dernière synchro'];
		case 'CompteurVisiteurs':
			return ['Alerte', 'Humidité', 'Température', 'Dernière mesure'];
		case 'EclairageIntelligent':
			return ['Nb actuel', 'Pic du jour', 'Capacité max'];
		case 'AmbianceSonore':
			return ['Mode', 'État', 'Allumé', 'Intensité', 'Présence détectée'];
		case 'SerrureConnectee':
			return ['Zone', 'Piste', 'Volume', 'Lecture'];
		case 'CameraIntelligente':
			return ['État', 'Dernier accès', 'Tentative refusée'];
		case 'EtiquetteNFC':
			return ['État', 'Connexion', 'Dernier mouvement'];
		case 'PriseConnectee':
			return ['Nb scans', 'Dernier scan', 'Lien accédé'];
		case 'DetecteurFumee':
			return ['État', 'Consommation', 'Programmation'];
		case 'GuideAudio':
			return ['Mode', 'État', 'Opacité'];
		case 'TrainAutonome':
			return ['Statut', 'Batterie', 'Trajet prévu', 'Audio en cours', 'Position actuelle', 'Dernier arrêt effectué', 'Nombre de passagers à bord'];
		default:
			return [];
	}
}