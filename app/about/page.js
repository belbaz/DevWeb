import { Box, Typography } from '@mui/material';

export default function About() {
	return (
		<Box>
			<main>
				<h1>The Connected Museum</h1>
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 2 }}>

					<p>
						MuseHome is an innovative digital platform designed to transform the traditional museum experience through Internet of Things (IoT) technology. Developed as part of a web development module, this project creates an intelligent museum environment where physical spaces are enhanced through a variety of connected objects.
					</p>

					<p>
						The platform centralizes access to exhibitions, guided tours, interactive objects, and services related to security, ambiance, and energy consumption. It features a multi-tier user system with different access levels, from occasional visitors to administrators, with users progressing through a points-based advancement system.
					</p>

					<Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 7 }}><h2 className="text-xl font-semibold mt-6 mb-3">Integrated Smart Devices</h2></Box>
					<ul className="list-disc pl-5 space-y-1">
						<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 2 }}>

							<li className="text-gray-700 text-lg">Geolocated audio guides</li>
							<li className="text-gray-700 text-lg">Climate sensors for artwork preservation</li>
							<li className="text-gray-700 text-lg">Visitor counters</li>
							<li className="text-gray-700 text-lg">Adaptive lighting systems</li>
							<li className="text-gray-700 text-lg">Thematic sound environments</li>
							<li className="text-gray-700 text-lg">Smart security cameras</li>
							<li className="text-gray-700 text-lg">NFC tags for enhanced content access</li>
							<li className="text-gray-700 text-lg">An autonomous train guiding visitors between exhibitions</li>
						</Box>
					</ul>

					<Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', flexDirection: 'column' }}>
						<p className="mt-6">
							Built with React for the front-end and Next.js for the back-end, with data stored in Supabase (PostgreSQL), the platform provides a responsive and modular interface with fine-grained access control. The architecture is Boxided into four main modules: Information, Visualization, Management, and Administration, each tailored to specific user profiles.
						</p>

						<p className="mt-4">
							MuseHome represents more than just a museum website—it's an interactive, intelligent, and evolving platform that connects visitors, staff, and the technologies embedded within exhibitions to create a truly modern museum experience.
						</p>
					</Box>
				</Box>

				<br />
				<Typography variant='h6' sx={{ fontFamily: 'Cinzel' }}>This text was written by humans &lt;3</Typography>
			</main>
		</Box>
	);
}
