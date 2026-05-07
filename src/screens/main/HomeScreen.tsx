import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	TextInput,
	StyleSheet,
	Image,
	FlatList,
	Alert,
	ActivityIndicator,
	Keyboard,
	TouchableWithoutFeedback,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useThemeColors } from '../../hooks/useThemeColors';
import SideMenu from '../../components/SideMenu';
import { useBombaStore } from '../../store/bombaStore';
import { searchLocations, NominatimResult } from '../../services/nominatim';
import { Bomba } from '../../types/bomba';

const DEFAULT_REGION: Region = {
	latitude: -8.903,
	longitude: 13.268,
	latitudeDelta: 0.05,
	longitudeDelta: 0.05,
};

export default function HomeScreen() {
	const { themeColors, isDark } = useThemeColors();
	const insets = useSafeAreaInsets();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [userLocation, setUserLocation] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);
	const [isLocating, setIsLocating] = useState(false);

	const mapRef = useRef<MapView>(null);
	const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const { bombas, setBombaSelecionada } = useBombaStore();

	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

	useEffect(() => {
		(async () => {
			const { status } =
				await Location.requestForegroundPermissionsAsync();
			if (status === 'granted') {
				try {
					const location = await Location.getCurrentPositionAsync({});
					setUserLocation({
						latitude: location.coords.latitude,
						longitude: location.coords.longitude,
					});
				} catch {
					console.log('Error getting location');
				}
			}
		})();
	}, []);

	useEffect(() => {
		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}

		if (searchQuery.length >= 3) {
			setIsSearching(true);
			searchTimeoutRef.current = setTimeout(async () => {
				const results = await searchLocations(searchQuery);
				setSearchResults(results);
				setIsSearching(false);
			}, 500);
		} else {
			setSearchResults([]);
		}

		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
		};
	}, [searchQuery]);

	const handleSearchResultPress = (result: NominatimResult) => {
		Keyboard.dismiss();
		const newRegion: Region = {
			latitude: parseFloat(result.lat),
			longitude: parseFloat(result.lon),
			latitudeDelta: 0.02,
			longitudeDelta: 0.02,
		};
		mapRef.current?.animateToRegion(newRegion, 500);
		setSearchQuery(result.display_name.split(',')[0]);
		setSearchResults([]);
	};

	const recenterToUser = async () => {
		if (!userLocation) {
			setIsLocating(true);
			try {
				const { status } =
					await Location.requestForegroundPermissionsAsync();
				if (status === 'granted') {
					const location = await Location.getCurrentPositionAsync({});
					const newLocation = {
						latitude: location.coords.latitude,
						longitude: location.coords.longitude,
					};
					setUserLocation(newLocation);
					mapRef.current?.animateToRegion(
						{
							...newLocation,
							latitudeDelta: 0.02,
							longitudeDelta: 0.02,
						},
						500,
					);
				} else {
					Alert.alert(
						'Permissão negada',
						'Ative a localização para usar este recurso.',
					);
				}
			} catch {
				Alert.alert('Erro', 'Não foi possível obter sua localização.');
			}
			setIsLocating(false);
		} else {
			mapRef.current?.animateToRegion(
				{
					...userLocation,
					latitudeDelta: 0.02,
					longitudeDelta: 0.02,
				},
				500,
			);
		}
	};

	const rotateToNorth = () => {
		mapRef.current?.animateCamera({ heading: 0 }, { duration: 500 });
	};

	const handleMarkerPress = (bomba: Bomba) => {
		setBombaSelecionada(bomba);
	};

	const getCombustivelPrice = (bomba: Bomba, tipo: string) => {
		const combustivel = bomba.combustiveis.find((c) => c.tipo === tipo);
		return combustivel ? `${combustivel.preco.toFixed(0)} Kz` : '-';
	};

	const getCombustivelDisponivel = (bomba: Bomba, tipo: string) => {
		const combustivel = bomba.combustiveis.find((c) => c.tipo === tipo);
		return combustivel?.disponivel ?? false;
	};

	const searchBarBgStyle = useMemo(
		() => ({
			backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
		}),
		[isDark],
	);

	const renderSearchResult = ({ item }: { item: NominatimResult }) => (
		<TouchableOpacity
			style={[
				styles.searchResultItem,
				{ backgroundColor: themeColors.card },
			]}
			onPress={() => handleSearchResultPress(item)}
		>
			<Ionicons
				name="location-outline"
				size={20}
				color={themeColors.secondary}
			/>
			<Text
				style={[styles.searchResultText, { color: themeColors.text }]}
				numberOfLines={2}
			>
				{item.display_name.split(',').slice(0, 2).join(',')}
			</Text>
		</TouchableOpacity>
	);

	return (
		<KeyboardAvoidingView
			style={[
				styles.container,
				{ backgroundColor: themeColors.background },
			]}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			keyboardVerticalOffset={0}
		>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<View style={StyleSheet.absoluteFillObject}>
					<SideMenu
						isOpen={isMenuOpen}
						onClose={toggleMenu}
						userName="Lourenço António"
					/>

					<MapView
						ref={mapRef}
						style={styles.map}
						initialRegion={DEFAULT_REGION}
						showsUserLocation
						showsMyLocationButton={false}
						onPress={() => Keyboard.dismiss()}
					>
						{bombas.map((bomba) => (
							<Marker
								key={bomba.id}
								coordinate={{
									latitude: bomba.latitude,
									longitude: bomba.longitude,
								}}
								onPress={() => handleMarkerPress(bomba)}
							>
								<View
									style={[
										styles.markerContainer,
										{
											backgroundColor: bomba.aberto
												? themeColors.primary
												: themeColors.gray,
										},
									]}
								>
									<MaterialCommunityIcons
										name="fuel"
										size={18}
										color="#000"
									/>
								</View>
								<Callout tooltip>
									<View
										style={[
											styles.calloutContainer,
											{
												backgroundColor:
													themeColors.card,
											},
										]}
									>
										<View style={styles.calloutHeader}>
											<View
												style={styles.calloutHeaderLeft}
											>
												<View
													style={[
														styles.statusDot,
														bomba.aberto
															? styles.bgAberto
															: styles.bgFechado,
													]}
												/>
												<Text
													style={styles.calloutNome}
												>
													{bomba.nome}
												</Text>
											</View>
											<Text
												style={[
													styles.statusBadgeText,
													bomba.aberto
														? styles.textAberto
														: styles.textFechado,
												]}
											>
												{bomba.aberto
													? 'Aberto'
													: 'Fechado'}
											</Text>
										</View>

										<Text style={styles.calloutAddress}>
											{bomba.endereco}
										</Text>

										<View style={styles.calloutDivider} />

										<View style={styles.combustivelList}>
											<View style={styles.combustivelRow}>
												<MaterialCommunityIcons
													name="oil"
													size={18}
													color="#F59E0B"
												/>
												<Text
													style={
														styles.combustivelNome
													}
												>
													Gasolina
												</Text>
												<Text
													style={
														styles.combustivelPreco
													}
												>
													{getCombustivelPrice(
														bomba,
														'gasolina',
													)}
												</Text>
												{getCombustivelDisponivel(
													bomba,
													'gasolina',
												) ? (
													<Ionicons
														name="checkmark-circle"
														size={20}
														color="#22C55E"
													/>
												) : (
													<Ionicons
														name="close-circle"
														size={20}
														color="#EF4444"
													/>
												)}
											</View>

											<View style={styles.combustivelRow}>
												<MaterialCommunityIcons
													name="fuel"
													size={18}
													color="#6B7280"
												/>
												<Text
													style={
														styles.combustivelNome
													}
												>
													Diesel
												</Text>
												<Text
													style={
														styles.combustivelPreco
													}
												>
													{getCombustivelPrice(
														bomba,
														'diesel',
													)}
												</Text>
												{getCombustivelDisponivel(
													bomba,
													'diesel',
												) ? (
													<Ionicons
														name="checkmark-circle"
														size={20}
														color="#22C55E"
													/>
												) : (
													<Ionicons
														name="close-circle"
														size={20}
														color="#EF4444"
													/>
												)}
											</View>

											<View style={styles.combustivelRow}>
												<MaterialCommunityIcons
													name="fire"
													size={18}
													color="#F97316"
												/>
												<Text
													style={
														styles.combustivelNome
													}
												>
													Gas
												</Text>
												<Text
													style={
														styles.combustivelPreco
													}
												>
													{getCombustivelPrice(
														bomba,
														'gás',
													)}
												</Text>
												{getCombustivelDisponivel(
													bomba,
													'gás',
												) ? (
													<Ionicons
														name="checkmark-circle"
														size={20}
														color="#22C55E"
													/>
												) : (
													<Ionicons
														name="close-circle"
														size={20}
														color="#EF4444"
													/>
												)}
											</View>
										</View>

										<TouchableOpacity
											style={styles.ctaButton}
											onPress={() =>
												handleMarkerPress(bomba)
											}
										>
											<Text style={styles.ctaText}>
												Ver detalhes
											</Text>
											<Ionicons
												name="arrow-forward"
												size={16}
												color={themeColors.primary}
											/>
										</TouchableOpacity>
									</View>
								</Callout>
							</Marker>
						))}
					</MapView>

					<View
						style={[
							styles.searchContainer,
							{ top: insets.top + 10 },
						]}
					>
						<View style={[styles.searchBar, searchBarBgStyle]}>
							<View
								style={[
									styles.searchIconContainer,
									{ backgroundColor: themeColors.primary },
								]}
							>
								<Ionicons
									name="search"
									size={20}
									color="#000"
								/>
							</View>
							<TextInput
								style={[
									styles.searchText,
									{ color: themeColors.text },
								]}
								placeholder="Pesquisar cidade, bairro..."
								placeholderTextColor={themeColors.secondary}
								value={searchQuery}
								onChangeText={setSearchQuery}
							/>
							{searchQuery.length > 0 && (
								<TouchableOpacity
									onPress={() => setSearchQuery('')}
								>
									<Ionicons
										name="close-circle"
										size={20}
										color={themeColors.secondary}
									/>
								</TouchableOpacity>
							)}
						</View>

						{searchResults.length > 0 && (
							<FlatList
								data={searchResults}
								renderItem={renderSearchResult}
								keyExtractor={(item) =>
									item.place_id.toString()
								}
								style={[
									styles.searchResults,
									{ backgroundColor: themeColors.card },
								]}
								showsVerticalScrollIndicator={false}
							/>
						)}

						{isSearching && (
							<View
								style={[
									styles.searchResults,
									{ backgroundColor: themeColors.card },
								]}
							>
								<ActivityIndicator
									color={themeColors.primary}
								/>
							</View>
						)}
					</View>

					<View style={[styles.header, { top: insets.top }]}>
						<Image
							source={require('../../../assets/images/logoBG.png')}
							style={styles.logo}
						/>
						<TouchableOpacity
							onPress={toggleMenu}
							style={styles.menuButton}
						>
							<Ionicons
								name="menu-outline"
								size={32}
								color={themeColors.text}
							/>
						</TouchableOpacity>
					</View>

					<TouchableOpacity
						style={[
							styles.recenterButton,
							{
								backgroundColor: themeColors.card,
								bottom: insets.bottom + 80,
							},
						]}
						onPress={rotateToNorth}
						activeOpacity={0.8}
					>
						<Ionicons
							name="compass"
							size={24}
							color={themeColors.primary}
						/>
					</TouchableOpacity>

					<TouchableOpacity
						style={[
							styles.recenterButton,
							{
								backgroundColor: themeColors.card,
								bottom: insets.bottom + 20,
							},
						]}
						onPress={recenterToUser}
						activeOpacity={0.8}
					>
						{isLocating ? (
							<ActivityIndicator color={themeColors.primary} />
						) : (
							<Ionicons
								name="locate"
								size={24}
								color={themeColors.primary}
							/>
						)}
					</TouchableOpacity>
				</View>
			</TouchableWithoutFeedback>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	bgAberto: { backgroundColor: '#22C55E' },
	bgFechado: { backgroundColor: '#EF4444' },
	textAberto: { color: '#22C55E' },
	textFechado: { color: '#EF4444' },
	container: {
		flex: 1,
	},
	map: {
		...StyleSheet.absoluteFillObject,
	},
	header: {
		position: 'absolute',
		left: 20,
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 8,
		zIndex: 10,
	},
	logo: {
		width: 45,
		height: 45,
		borderRadius: 12,
		resizeMode: 'cover',
	},
	menuButton: {
		marginLeft: 10,
		width: 45,
		height: 45,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(255,255,255,0.9)',
		borderRadius: 12,
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
	},
	searchContainer: {
		position: 'absolute',
		left: 20,
		right: 20,
		zIndex: 20,
	},
	searchBar: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		borderRadius: 16,
		height: 56,
		elevation: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 12,
	},
	searchIconContainer: {
		width: 36,
		height: 36,
		borderRadius: 10,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	searchText: {
		flex: 1,
		fontSize: 16,
		fontWeight: '500',
	},
	searchResults: {
		marginTop: 8,
		borderRadius: 12,
		maxHeight: 200,
		elevation: 6,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
	},
	searchResultItem: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 14,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(0,0,0,0.05)',
	},
	searchResultText: {
		flex: 1,
		marginLeft: 12,
		fontSize: 14,
		fontWeight: '500',
	},
	markerContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 3,
		borderColor: '#FFF',
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
	},
	calloutContainer: {
		width: 260,
		padding: 16,
		borderRadius: 16,
		elevation: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.2,
		shadowRadius: 16,
	},
	calloutHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 6,
	},
	calloutHeaderLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	statusDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginRight: 8,
	},
	calloutNome: {
		fontSize: 15,
		fontWeight: '700',
		color: '#1B365D',
		flex: 1,
	},
	statusBadgeText: {
		fontSize: 11,
		fontWeight: '600',
	},
	calloutAddress: {
		fontSize: 11,
		color: '#6B7280',
		marginBottom: 10,
	},
	calloutDivider: {
		height: 1,
		backgroundColor: '#E5E7EB',
		marginBottom: 10,
	},
	combustivelList: {
		marginBottom: 8,
	},
	combustivelRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 6,
		borderBottomWidth: 1,
		borderBottomColor: '#F3F4F6',
	},
	combustivelNome: {
		fontSize: 13,
		fontWeight: '500',
		color: '#374151',
		flex: 1,
		marginLeft: 10,
	},
	combustivelPreco: {
		fontSize: 14,
		fontWeight: '700',
		color: '#1B365D',
		marginRight: 10,
		minWidth: 70,
		textAlign: 'right',
	},
	ctaButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 12,
		paddingVertical: 10,
		backgroundColor: '#F3F4F6',
		borderRadius: 10,
	},
	ctaText: {
		fontSize: 13,
		fontWeight: '600',
		color: '#1B365D',
		marginRight: 6,
	},
	recenterButton: {
		position: 'absolute',
		right: 20,
		width: 50,
		height: 50,
		borderRadius: 25,
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 6,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.15,
		shadowRadius: 6,
	},
});
