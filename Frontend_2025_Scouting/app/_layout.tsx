import { Stack, router, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { LogBox, StatusBar } from "react-native";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { CompetitionProvider } from "../contexts/CompetitionContext";

/**
 * Protected routes component
 * Redirects to login if user is not authenticated
 */
function ProtectedRoutes() {
    const { user, loading } = useAuth();
    const segments = useSegments();

    useEffect(() => {
        if (loading) return; // Wait for auth to load

        const inAuthGroup = segments[0] === '(login)';
        const inAuthScreens = segments[0] === 'login' || segments[0] === 'signup';

        if (!user && !inAuthScreens && inAuthGroup) {
            // User not logged in, trying to access protected route
            console.log('[Router] Redirecting to login - user not authenticated');
            router.replace('/login');
        } else if (user && inAuthScreens) {
            // User logged in, on login/signup screen - redirect to home
            console.log('[Router] Redirecting to home - user already authenticated');
            router.replace('/(login)/home');
        }
    }, [user, loading, segments]);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                    headerTitle: "Welcome Page"
                }}
            />
            <Stack.Screen
                name="login"
                options={{
                    headerShown: false,
                    headerTitle: "Sign In",
                    presentation: 'card',
                }}
            />
            <Stack.Screen
                name="signup"
                options={{
                    headerShown: false,
                    headerTitle: "Sign Up",
                    presentation: 'card',
                }}
            />
            <Stack.Screen
                name="(login)"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    );
}

const RootLayout = () => {
    useEffect(() => {
        // Disable all LogBox warnings and errors for demo mode
        LogBox.ignoreAllLogs(true);
    }, []);

    return (
        <AuthProvider>
            <CompetitionProvider>
                <StatusBar barStyle="dark-content" backgroundColor="#E6F4FF" />
                <ProtectedRoutes />
            </CompetitionProvider>
        </AuthProvider>
    );
}

export default RootLayout;
