export default function objectDataFields(objectType) {
	switch (objectType) {
		case 'VitreElectrochrome':
			return ['State', 'Last test', 'Battery level'];
		case 'CapteurClimat':
			return ['state', 'Battery level', 'Affectation', 'Last sync'];
		case 'CompteurVisiteurs':
			return ['Alert', 'Humidity', 'Temperature', 'Last measurement'];
		case 'EclairageIntelligent':
			return ['Current number', 'Daily max', 'Max capacity'];
		case 'AmbianceSonore':
			return ['Mode', 'State', 'Turned on', 'Intensity', 'Detected presence'];
		case 'SerrureConnectee':
			return ['Area', 'Track', 'Volume', 'Playback'];
		case 'CameraIntelligente':
			return ['State', 'Last access', 'Failed attempts'];
		case 'EtiquetteNFC':
			return ['State', 'Connexion', 'Last movement'];
		case 'PriseConnectee':
			return ['Scans', 'Last scan', 'Accessed link'];
		case 'DetecteurFumee':
			return ['State', 'Power', 'Time slot'];
		case 'GuideAudio':
			return ['Mode', 'State', 'Opacity', 'Last test', 'Battery level'];
		case 'TrainAutonome':
			return ['State', 'Battery', 'Route', 'Current audio', 'Current location', 'Last stop made', 'Current passengers'];
		default:
			return [];
	}
}