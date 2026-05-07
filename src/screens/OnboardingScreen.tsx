import React, { useState, useRef, useEffect } from 'react';
import {
	View,
	Text,
	Dimensions,
	TouchableOpacity,
	StyleSheet,
	StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	useAnimatedScrollHandler,
	interpolate,
	Extrapolation,
	SharedValue,
	withTiming,
	withRepeat,
	withSequence,
	FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { gradients, colors } from '../store/colors';
import { useThemeColors } from '../hooks/useThemeColors';

const { width } = Dimensions.get('window');

interface Slide {
	id: string;
	title: string;
	description: string;
	icon: keyof typeof Ionicons.glyphMap;
	iconColor: string;
	gradientColors: readonly [string, string, ...string[]];
}

const SLIDES: Slide[] = [
	{
		id: '1',
		title: 'Encontre Bombas',
		description:
			'Localize rapidamente as bombas de combustível mais próximas de si com nosso mapa interativo.',
		icon: 'map',
		iconColor: '#F58220',
		gradientColors: ['#F58220', '#FF9F4A', '#FFE5C4'],
	},
	{
		id: '2',
		title: 'Disponibilidade Real',
		description:
			'Economize tempo sabendo em tempo real quais postos têm o combustível que precisa.',
		icon: 'analytics',
		iconColor: '#00A99D',
		gradientColors: ['#00A99D', '#3AB5B0', '#B8EAE7'],
	},
	{
		id: '3',
		title: 'Chegue no Destino',
		description:
			'Navegue facilmente com as melhores rotas até a bomba de combustível escolhida.',
		icon: 'navigate',
		iconColor: '#34527E',
		gradientColors: ['#34527E', '#1B365D', '#C4D4E8'],
	},
];

const AnimatedTouchableOpacity =
	Animated.createAnimatedComponent(TouchableOpacity);

const Dot = ({
	index,
	scrollX,
	isActive,
}: {
	index: number;
	scrollX: SharedValue<number>;
	isActive: boolean;
}) => {
	const animatedDotStyle = useAnimatedStyle(() => {
		const inputRange = [
			(index - 1) * width,
			index * width,
			(index + 1) * width,
		];

		const dotWidth = interpolate(
			scrollX.value,
			inputRange,
			[10, 28, 10],
			Extrapolation.CLAMP,
		);

		const opacity = interpolate(
			scrollX.value,
			inputRange,
			[0.4, 1, 0.4],
			Extrapolation.CLAMP,
		);

		return {
			width: dotWidth,
			opacity,
			backgroundColor: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
		};
	});

	return <Animated.View style={[styles.dot, animatedDotStyle]} />;
};

const IconContainer = ({
	icon,
	color,
	gradientColors,
	index,
	scrollX,
}: {
	icon: keyof typeof Ionicons.glyphMap;
	color: string;
	gradientColors: readonly [string, string, ...string[]];
	index: number;
	scrollX: SharedValue<number>;
}) => {
	const animatedStyle = useAnimatedStyle(() => {
		const inputRange = [
			(index - 1) * width,
			index * width,
			(index + 1) * width,
		];

		const scale = interpolate(
			scrollX.value,
			inputRange,
			[0.8, 1, 0.8],
			Extrapolation.CLAMP,
		);

		const rotate = interpolate(
			scrollX.value,
			inputRange,
			[-15, 0, 15],
			Extrapolation.CLAMP,
		);

		return {
			transform: [{ scale }, { rotate: `${rotate}deg` }],
		};
	});

	const glowScale = useSharedValue(1);

	useEffect(() => {
		glowScale.value = withRepeat(
			withSequence(
				withTiming(1.1, { duration: 1500 }),
				withTiming(1, { duration: 1500 }),
			),
			-1,
			true,
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const glowStyle = useAnimatedStyle(() => ({
		transform: [{ scale: glowScale.value }],
		opacity: interpolate(glowScale.value, [1, 1.1], [0.3, 0.6]),
	}));

	return (
		<Animated.View style={[styles.iconContainer, animatedStyle]}>
			<Animated.View
				style={[
					styles.iconGlow,
					glowStyle,
					{ backgroundColor: gradientColors[0] },
				]}
			/>
			<LinearGradient
				colors={gradientColors as any}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={styles.iconGradient}
			>
				<Ionicons name={icon} size={48} color={color} />
			</LinearGradient>
		</Animated.View>
	);
};

const GlassCard = ({ children, index, scrollX }: any) => {
	const animatedStyle = useAnimatedStyle(() => {
		const inputRange = [
			(index - 1) * width,
			index * width,
			(index + 1) * width,
		];

		const translateY = interpolate(
			scrollX.value,
			inputRange,
			[50, 0, 50],
			Extrapolation.CLAMP,
		);

		const opacity = interpolate(
			scrollX.value,
			inputRange,
			[0, 1, 0],
			Extrapolation.CLAMP,
		);

		return {
			transform: [{ translateY }],
			opacity,
		};
	});

	return (
		<Animated.View style={[styles.glassCard, animatedStyle]}>
			{children}
		</Animated.View>
	);
};

export default function OnboardingScreen() {
	const navigation =
		useNavigation<
			NativeStackNavigationProp<RootStackParamList, 'Onboarding'>
		>();
	const [currentIndex, setCurrentIndex] = useState(0);
	const flatListRef = useRef<Animated.FlatList<any>>(null);
	const scrollX = useSharedValue(0);

	const { isDark } = useThemeColors();

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			scrollX.value = event.contentOffset.x;
		},
	});

	const handleNext = () => {
		if (currentIndex < SLIDES.length - 1) {
			flatListRef.current?.scrollToIndex({
				index: currentIndex + 1,
				animated: true,
			});
		}
	};

	const handleSkip = () => {
		navigation.replace('Auth', { screen: 'Login' });
	};

	const handleGetStarted = () => {
		navigation.replace('Auth', { screen: 'Login' });
	};

	const progressWidth = useAnimatedStyle(() => {
		const progress = interpolate(
			scrollX.value,
			[0, width * (SLIDES.length - 1)],
			[0, 100],
			Extrapolation.CLAMP,
		);
		return {
			width: `${progress}%`,
		};
	});

	return (
		<View className="flex-1">
			<StatusBar
				barStyle="light-content"
				backgroundColor="transparent"
				translucent
			/>

			<LinearGradient
				colors={
					isDark
						? ([gradients.dark[0], gradients.dark[1]] as any)
						: (gradients.background as any)
				}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={styles.gradientBackground}
			/>

			<View style={StyleSheet.absoluteFill}>
				<View style={styles.decorCircle1} />
				<View style={styles.decorCircle2} />
				<View style={styles.decorCircle3} />
			</View>

			<SafeAreaView style={styles.container}>
				<Animated.View
					entering={FadeIn.duration(500)}
					style={styles.header}
				>
					<View style={styles.logoContainer}>
						<View style={styles.logoPlaceholder}>
							<Ionicons
								name="flame"
								size={24}
								color={colors.light.background}
							/>
						</View>
						<Text style={styles.logoText}>GasMap</Text>
					</View>

					<TouchableOpacity
						onPress={handleSkip}
						style={styles.skipButton}
						activeOpacity={0.7}
					>
						<Text style={styles.skipText}>Pular</Text>
					</TouchableOpacity>
				</Animated.View>

				<View style={styles.progressContainer}>
					<View style={styles.progressBar}>
						<Animated.View
							style={[styles.progressFill, progressWidth]}
						/>
					</View>
				</View>

				<Animated.FlatList
					ref={flatListRef}
					data={SLIDES}
					horizontal
					pagingEnabled
					onScroll={scrollHandler}
					scrollEventThrottle={16}
					bounces={false}
					showsHorizontalScrollIndicator={false}
					onMomentumScrollEnd={(e) => {
						const index = Math.round(
							e.nativeEvent.contentOffset.x / width,
						);
						setCurrentIndex(index);
					}}
					keyExtractor={(item) => item.id}
					renderItem={({ item, index }) => (
						<View style={[styles.slide, { width }]}>
							<IconContainer
								icon={item.icon}
								color={item.iconColor}
								gradientColors={item.gradientColors}
								index={index}
								scrollX={scrollX}
							/>

							<GlassCard index={index} scrollX={scrollX}>
								<Text style={styles.title}>{item.title}</Text>
								<Text style={styles.description}>
									{item.description}
								</Text>
							</GlassCard>
						</View>
					)}
				/>

				<View style={styles.footer}>
					<View style={styles.dotsContainer}>
						{SLIDES.map((_, i) => (
							<Dot
								key={i}
								index={i}
								scrollX={scrollX}
								isActive={i === currentIndex}
							/>
						))}
					</View>

					{currentIndex < SLIDES.length - 1 ? (
						<AnimatedTouchableOpacity
							onPress={handleNext}
							activeOpacity={0.8}
							style={styles.nextButton}
						>
							<LinearGradient
								colors={
									isDark
										? (['#F58220', '#F5A623'] as any)
										: (gradients.primary as any)
								}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 0 }}
								style={styles.nextButtonGradient}
							>
								<Text style={styles.nextButtonText}>
									Próximo
								</Text>
								<Ionicons
									name="arrow-forward"
									size={20}
									color={colors.light.text}
								/>
							</LinearGradient>
						</AnimatedTouchableOpacity>
					) : (
						<AnimatedTouchableOpacity
							onPress={handleGetStarted}
							activeOpacity={0.8}
							style={styles.getStartedButton}
						>
							<LinearGradient
								colors={
									isDark
										? (['#F58220', '#F5A623'] as any)
										: (gradients.primary as any)
								}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 0 }}
								style={styles.getStartedButtonGradient}
							>
								<Text style={styles.getStartedText}>
									Começar
								</Text>
								<Ionicons
									name="rocket"
									size={20}
									color={colors.light.text}
								/>
							</LinearGradient>
						</AnimatedTouchableOpacity>
					)}
				</View>
			</SafeAreaView>
		</View>
	);
}

const styles = StyleSheet.create({
	gradientBackground: {
		...StyleSheet.absoluteFillObject,
	},
	decorCircle1: {
		position: 'absolute',
		top: -100,
		right: -100,
		width: 300,
		height: 300,
		borderRadius: 150,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
	},
	decorCircle2: {
		position: 'absolute',
		bottom: 100,
		left: -150,
		width: 250,
		height: 250,
		borderRadius: 125,
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
	},
	decorCircle3: {
		position: 'absolute',
		bottom: -50,
		right: -50,
		width: 200,
		height: 200,
		borderRadius: 100,
		backgroundColor: 'rgba(255, 255, 255, 0.05)',
	},
	container: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 24,
		paddingTop: 8,
	},
	logoContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	logoPlaceholder: {
		width: 40,
		height: 40,
		borderRadius: 12,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	logoText: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#FFFFFF',
		letterSpacing: 0.5,
	},
	skipButton: {
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	skipText: {
		fontSize: 16,
		fontWeight: '600',
		color: 'rgba(255, 255, 255, 0.8)',
	},
	progressContainer: {
		paddingHorizontal: 24,
		marginTop: 20,
	},
	progressBar: {
		height: 4,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		borderRadius: 2,
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		backgroundColor: '#FFFFFF',
		borderRadius: 2,
	},
	slide: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 24,
	},
	iconContainer: {
		width: 140,
		height: 140,
		marginBottom: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	iconGlow: {
		position: 'absolute',
		width: 140,
		height: 140,
		borderRadius: 70,
		opacity: 0.3,
	},
	iconGradient: {
		width: 120,
		height: 120,
		borderRadius: 60,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 16,
		elevation: 10,
	},
	glassCard: {
		width: '100%',
		paddingHorizontal: 8,
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
		color: '#FFFFFF',
		textAlign: 'center',
		marginBottom: 16,
		letterSpacing: 0.3,
	},
	description: {
		fontSize: 16,
		color: 'rgba(255, 255, 255, 0.85)',
		textAlign: 'center',
		lineHeight: 24,
		paddingHorizontal: 16,
	},
	footer: {
		paddingHorizontal: 24,
		paddingBottom: 24,
		paddingTop: 20,
		alignItems: 'center',
	},
	dotsContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 32,
		gap: 8,
	},
	dot: {
		height: 8,
		borderRadius: 4,
	},
	nextButton: {
		width: '100%',
		borderRadius: 16,
		overflow: 'hidden',
	},
	nextButtonGradient: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 16,
		gap: 8,
	},
	nextButtonText: {
		fontSize: 18,
		fontWeight: 'bold',
		color: colors.light.text,
	},
	getStartedButton: {
		width: '100%',
		borderRadius: 16,
		overflow: 'hidden',
	},
	getStartedButtonGradient: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 16,
		gap: 10,
	},
	getStartedText: {
		fontSize: 18,
		fontWeight: 'bold',
		color: colors.light.text,
	},
});
