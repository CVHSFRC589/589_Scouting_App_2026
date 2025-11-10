/**
 * Sign Up Screen - FRC Scouting App
 *
 * New user registration with email/password.
 * Open to anyone - primary goal is linking reports to students.
 *
 * Features:
 * - Email/password registration
 * - Display name (optional)
 * - Automatic profile creation via database trigger
 *
 * Learn more:
 * - Form validation: https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable
 * - Password security: https://supabase.com/docs/guides/auth/passwords
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen() {
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * Validate form inputs
   */
  const validateForm = (): { valid: boolean; message?: string } => {
    // Email validation
    if (!email.trim()) {
      return { valid: false, message: 'Please enter your email address.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { valid: false, message: 'Please enter a valid email address.' };
    }

    // Password validation
    if (!password) {
      return { valid: false, message: 'Please enter a password.' };
    }

    if (password.length < 6) {
      return {
        valid: false,
        message: 'Password must be at least 6 characters long.',
      };
    }

    // Confirm password
    if (password !== confirmPassword) {
      return { valid: false, message: 'Passwords do not match.' };
    }

    return { valid: true };
  };

  /**
   * Handle sign up button press
   */
  const handleSignUp = async () => {
    // Validate form
    const validation = validateForm();
    if (!validation.valid) {
      Alert.alert('Validation Error', validation.message!);
      return;
    }

    setLoading(true);

    try {
      const { error, session } = await signUp(
        email,
        password,
        displayName.trim() || undefined
      );

      if (error) {
        // User-friendly error messages
        if (error.message?.includes('already registered')) {
          Alert.alert(
            'Account Exists',
            'This email is already registered. Try signing in instead.'
          );
        } else if (error.message?.includes('Password should be')) {
          Alert.alert('Weak Password', error.message);
        } else {
          Alert.alert('Sign Up Error', error.message || 'Failed to create account.');
        }
      } else {
        // Success!
        // If session exists, user is automatically logged in (email confirmation disabled)
        if (session) {
          console.log('[SignUp] User automatically logged in, redirecting to home');
          Alert.alert(
            'Account Created! 🎉',
            'Welcome to the scouting app! You are now logged in.',
            [
              {
                text: 'Get Started',
                onPress: () => router.replace('/(login)/home'),
              },
            ]
          );
        } else {
          // Email confirmation required (shouldn't happen with our settings)
          Alert.alert(
            'Account Created! 🎉',
            'Welcome to the scouting app! You can now sign in.',
            [
              {
                text: 'Sign In',
                onPress: () => router.replace('/login'),
              },
            ]
          );
        }
      }
    } catch (err) {
      console.error('[SignUp] Exception:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigate back to login
   */
  const handleBackToLogin = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/login');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join your team's scouting crew!</Text>
        </View>

        {/* Sign Up Form */}
        <View style={styles.formContainer}>
          {/* Display Name Input (Optional) */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Display Name <Text style={styles.optional}>(optional)</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#999"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              editable={!loading}
            />
            <Text style={styles.hint}>
              How you'll appear in reports (default: email username)
            </Text>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="your.email@example.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password *</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="At least 6 characters"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>Minimum 6 characters</Text>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password *</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Re-enter password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpButton, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signUpButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Back to Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleBackToLogin} disabled={loading}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>📝 Registration is open to all students</Text>
          <Text style={styles.footerSubtext}>
            Your account links scouting reports to you
          </Text>
          <Text style={styles.footerSubtext}>
            Passwords are stored securely with Supabase
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  optional: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#999',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 10,
    paddingRight: 12,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  signUpButton: {
    backgroundColor: '#0066cc',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
});
