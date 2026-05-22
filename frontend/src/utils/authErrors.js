import { getCanonicalFrontendOrigin } from "./googleAuthOrigin";

export const getGoogleSignInErrorMessage = (error) => {
  if (error?.code === "auth/unauthorized-domain") {
    const canonicalOrigin = getCanonicalFrontendOrigin();

    if (canonicalOrigin !== window.location.origin) {
      return `You are on a Vercel preview URL (${window.location.origin}). Google sign-in will use ${canonicalOrigin} instead. If that domain is still blocked, add it in Firebase Console > Authentication > Settings > Authorized domains.`;
    }

    return `Firebase has not authorized ${window.location.origin} for Google sign-in. Add this exact origin in Firebase Console > Authentication > Settings > Authorized domains.`;
  }

  if (error?.code === "auth/popup-closed-by-user") {
    return "Bạn đã đóng cửa sổ đăng nhập Google";
  }

  return error?.response?.data?.message || "Không thể đăng nhập bằng Google";
};