export const getGoogleSignInErrorMessage = (error) => {
  if (error?.code === "auth/unauthorized-domain") {
    return `Firebase has not authorized ${window.location.origin} for Google sign-in. Add this exact origin in Firebase Console > Authentication > Settings > Authorized domains. If this is a Vercel preview URL, add the preview domain or use the production domain.`;
  }

  if (error?.code === "auth/popup-closed-by-user") {
    return "Bạn đã đóng cửa sổ đăng nhập Google";
  }

  return error?.response?.data?.message || "Không thể đăng nhập bằng Google";
};