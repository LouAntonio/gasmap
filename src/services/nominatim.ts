import axios from 'axios';

export interface NominatimResult {
	place_id: number;
	display_name: string;
	lat: string;
	lon: string;
	type: string;
}

export const searchLocations = async (
	query: string,
): Promise<NominatimResult[]> => {
	if (!query || query.length < 3) return [];

	try {
		const response = await axios.get<NominatimResult[]>(
			'https://nominatim.openstreetmap.org/search',
			{
				params: {
					q: query,
					format: 'json',
					addressdetails: 1,
					limit: 5,
				},
				headers: {
					'User-Agent': 'Gasmap/1.0',
				},
			},
		);
		return response.data;
	} catch (error) {
		console.error('Error searching locations:', error);
		return [];
	}
};
