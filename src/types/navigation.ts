import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
	Login: undefined;
	Register: undefined;
	ForgotPassword: undefined;
	VerifyOTP: { email: string };
	ResetPassword: { email: string; otp: string };
};

export type MainStackParamList = {
	Home: undefined;
};

export type RootStackParamList = {
	Splash: undefined;
	Onboarding: undefined;
	Auth: NavigatorScreenParams<AuthStackParamList>;
	Main: NavigatorScreenParams<MainStackParamList>;
};
