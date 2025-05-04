export default function objectDataFields(objectType) {
	switch (objectType) {
		case 'ElectrochromicGlass':
			return ['State', 'Last test', 'Battery level'];
		case 'ClimateMonitor':
			return ['state', 'Battery level', 'Affectation', 'Last sync'];
		case 'VisitorCounter':
			return ['Alert', 'Humidity', 'Temperature', 'Last measurement'];
		case 'SmartLighting':
			return ['Current number', 'Daily max', 'Max capacity'];
		case 'AudioAtmosphere':
			return ['Mode', 'State', 'Turned on', 'Intensity', 'Detected presence'];
		case 'SmartLock':
			return ['Area', 'Track', 'Volume', 'Playback'];
		case 'SmartCamera':
			return ['State', 'Last access', 'Failed attempts'];
		case 'NFCTag':
			return ['State', 'Connexion', 'Last movement'];
		case 'SmartPlug':
			return ['Scans', 'Last scan', 'Accessed link'];
		case 'SmokeDetector':
			return ['State', 'Power', 'Time slot'];
		case 'AudioGuide':
			return ['Mode', 'State', 'Opacity', 'Last test', 'Battery level'];
		case 'AutonomousTrain':
			return ['State', 'Battery', 'Route', 'Current audio', 'Current location', 'Last stop made', 'Current passengers'];
		default:
			return [];
	}
}
