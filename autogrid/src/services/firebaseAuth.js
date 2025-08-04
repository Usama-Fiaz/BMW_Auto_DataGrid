import { auth, googleProvider, signInWithPopup, onAuthStateChanged } from '../config/firebase';
import axios from 'axios';

class FirebaseAuthService {
  constructor() {
    this.baseURL = 'http://localhost:5001';
    this.auth = auth;
  }

  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const idToken = await user.getIdToken();

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

  async sendTokenToBackend(token, userData) {
    try {
      const response = await axios.post(`${this.baseURL}/auth/firebase/verify`, {
        idToken: token,
        userData: userData
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return { success: true, data: response.data };

    } catch (error) {
      let errorMessage = 'Backend verification failed';
      
      if (error.response) {
        errorMessage = error.response.data?.error || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred';
      }

      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }

  getCurrentUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  getCurrentToken() {
    return localStorage.getItem('firebaseToken');
  }

  async signOut() {
    try {
      await auth.signOut();
      localStorage.removeItem('userData');
      localStorage.removeItem('firebaseToken');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
}

export default new FirebaseAuthService(); 