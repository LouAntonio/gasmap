import axios from 'axios';

export interface GooglePlaceResult {
	place_id: string;
	display_name: string;
	lat: string;
	lon: string;
	type: string;
}

interface GooglePlacesNewResponse {
	places?: Array<{
		id: string;
		displayName?: {
			text: string;
		};
		formattedAddress?: string;
		location?: {
			latitude: number;
			longitude: number;
		};
		primaryType?: string;
	}>;
}

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export const searchLocations = async (
	query: string,
): Promise<GooglePlaceResult[]> => {
	if (!query || query.length < 3) return [];

	try {
		const response = await axios.post<GooglePlacesNewResponse>(
			'https://places.googleapis.com/v1/places:searchText',
			{
				textQuery: query,
				languageCode: 'pt-PT',
			},
			{
				headers: {
					'Content-Type': 'application/json',
					'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
					'X-Goog-FieldMask':
						'places.id,places.displayName,places.formattedAddress,places.location,places.primaryType',
				},
			},
		);

		if (!response.data.places) {
			console.warn('No results found for query:', query);
			return [];
		}

		console.log('Google Places API response:', response.data);

		return response.data.places.map((place) => ({
			place_id: place.id,
			display_name:
				place.formattedAddress || place.displayName?.text || '',
			lat: place.location?.latitude.toString() || '0',
			lon: place.location?.longitude.toString() || '0',
			type: place.primaryType || 'point_of_interest',
		}));
	} catch (error: any) {
		console.error(
			'Error searching locations:',
			error.response?.data || error.message || error,
		);
		return [];
	}
};
