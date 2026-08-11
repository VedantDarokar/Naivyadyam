/**
 * Real Google OAuth 2.0 Client Utility
 * Integrates directly with Google's official OAuth 2.0 endpoints:
 *  - Google OAuth 2.0 Authorization Endpoint: https://accounts.google.com/o/oauth2/v2/auth
 *  - Google UserInfo API Endpoint: https://www.googleapis.com/oauth2/v3/userinfo
 */

const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_ID = rawClientId.trim();

/**
 * Trigger Real Google OAuth 2.0 Flow
 * Opens official accounts.google.com window or popup
 * @returns {Promise<{ email: string, name: string, picture: string }>}
 */
export const initiateRealGoogleSignIn = () => {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_CLIENT_ID) {
      return reject(new Error('Google Client ID is missing in configuration'));
    }

    // Check if official Google Identity Services GIS SDK is available
    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              try {
                // Fetch real user info from Google's official UserInfo API
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const googleProfile = await userInfoRes.json();
                if (googleProfile.email) {
                  return resolve({
                    email: googleProfile.email,
                    name: googleProfile.name || googleProfile.email.split('@')[0],
                    picture: googleProfile.picture || ''
                  });
                }
              } catch (err) {
                console.warn('Failed to fetch Google profile from access token:', err);
              }
            }
            reject(new Error('Google authorization was cancelled or failed'));
          },
          onerror: (err) => reject(err)
        });

        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('GIS TokenClient init warning:', err);
      }
    }

    // Fallback: Open Google's Official OAuth 2.0 Popup Window directly
    const redirectUri = window.location.origin;
    const scope = encodeURIComponent('https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email');
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${scope}&include_granted_scopes=true&prompt=select_account`;

    const width = 520;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      googleAuthUrl,
      'GoogleSignInPopup',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=1`
    );

    if (!popup) {
      return reject(new Error('Popup blocked by browser. Please allow popups for Google Sign-In.'));
    }

    // Listen for hash parameter redirect from Google OAuth
    const timer = setInterval(async () => {
      try {
        if (!popup || popup.closed) {
          clearInterval(timer);
          return reject(new Error('Google Sign-In popup was closed'));
        }

        if (popup.location.href.includes(redirectUri) && popup.location.hash) {
          const hashParams = new URLSearchParams(popup.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          
          popup.close();
          clearInterval(timer);

          if (accessToken) {
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            const googleProfile = await userInfoRes.json();
            if (googleProfile.email) {
              return resolve({
                email: googleProfile.email,
                name: googleProfile.name || googleProfile.email.split('@')[0],
                picture: googleProfile.picture || ''
              });
            }
          }
          reject(new Error('Failed to retrieve user information from Google OAuth'));
        }
      } catch {
        // Ignore cross-origin errors while popup is on accounts.google.com
      }
    }, 500);
  });
};
