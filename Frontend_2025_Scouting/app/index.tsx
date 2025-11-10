/**
 * Index/Welcome Screen
 *
 * Entry point of the app - redirects based on authentication status
 */

import { router } from "expo-router";
import { Image, Text, View, StyleSheet, ActivityIndicator } from "react-native";
import React, { useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";

const IndexScreen: React.FC = () => {
    const { user, loading } = useAuth();

    useEffect(() => {
        if (loading) return; // Wait for auth to initialize

        if (user) {
            // User is authenticated - go to home
            console.log('[Index] User authenticated, redirecting to home');
            router.replace('/(login)/home');
        } else {
            // User not authenticated - go to login
            console.log('[Index] User not authenticated, redirecting to login');
            router.replace('/login');
        }
    }, [user, loading]);

    // Show loading screen while checking auth
    return (
        <View style={styles.container}>
            <Image source={require('../assets/images/589_logo.png')} style={styles.logo} />
            <ActivityIndicator size="large" color="#0066cc" style={{ marginTop: 20 }} />
            <Text style={styles.loadingText}>Loading...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#f5f5f5',
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 24,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
});

export default IndexScreen;