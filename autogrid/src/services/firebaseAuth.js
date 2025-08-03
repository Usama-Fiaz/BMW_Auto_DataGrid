import { auth, googleProvider, signInWithPopup, onAuthStateChanged } from '../config/firebase';
import axios from 'axios';

class FirebaseAuthService {
  constructor() {
    this.baseURL = 'http://localhost:5001';
    this.auth = auth;
  }

  // Sign in with Google popup
  async signInWithGoogle() {
    try {
      console.log('🔄 Starting Google sign-in popup...');
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log('✅ Google sign-in successful:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      });

      // Get ID token
      const idToken = await user.getIdToken();
      console.log('🔑 ID Token retrieved:', idToken.substring(0, 50) + '...');

      // Store user data and token
      const userData = {
        id: user.uid,
        email: user.email,
        name: user.displayName,
        picture: user.photoURL,
        token: idToken
      };

      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('firebaseToken', idToken);

      return { success: true, user: userData, token: idToken };

    } catch (error) {
      console.error('❌ Firebase sign-in error:', error);
      
      let errorMessage = 'Sign-in failed';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in was cancelled';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup was blocked. Please allow popups for this site';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many sign-in attempts. Please try again later';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred';
      }

      return { 
        success: false, 
        error: errorMessage,
        code: error.code 
      };
    }
  }

  // Send ID token to backend
  async sendTokenToBackend(token, userData) {
    try {
      console.log('📤 Sending ID token to backend...');
      console.log('👤 User data being sent:', userData);
      
      const response = await axios.post(`${this.baseURL}/auth/firebase/verify`, {
        idToken: token,
        userData: userData
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Backend verification successful:', response.data);
      return { success: true, data: response.data };

    } catch (error) {
      console.error('❌ Backend verification failed:', error);
      
      let errorMessage = 'Backend verification failed';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.error || `Server error: ${error.response.status}`;
        console.error('Server error details:', error.response.data);
      } else if (error.request) {
        // Request was made but no response
        errorMessage = 'No response from server. Please check your connection.';
        console.error('Network error:', error.request);
      } else {
        // Something else happened
        errorMessage = error.message || 'An unexpected error occurred';
        console.error('Request setup error:', error.message);
      }

      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }

  // Get current user
  getCurrentUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  // Get current token
  getCurrentToken() {
    return localStorage.getItem('firebaseToken');
  }

  // Sign out
  async signOut() {
    try {
      await auth.signOut();
      localStorage.removeItem('userData');
      localStorage.removeItem('firebaseToken');
      console.log('✅ Sign-out successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Sign-out error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
}

export default new FirebaseAuthService(); 