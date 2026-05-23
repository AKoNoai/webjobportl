const PROFILE_CACHE_PREFIX = "jobportal_profile:";

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const getProfileCacheKey = (email = "") => {
  const normalizedEmail = normalizeEmail(email);
  return normalizedEmail ? `${PROFILE_CACHE_PREFIX}${normalizedEmail}` : "";
};

export const getCachedProfile = (email = "") => {
  const cacheKey = getProfileCacheKey(email);
  if (!cacheKey) return null;

  try {
    return JSON.parse(localStorage.getItem(cacheKey) || "null");
  } catch {
    return null;
  }
};

export const setCachedProfile = (profile = {}) => {
  const cacheKey = getProfileCacheKey(profile.email);
  if (!cacheKey) return;

  localStorage.setItem(cacheKey, JSON.stringify(profile));
};

export const mergeProfileFromCache = (profile = {}) => {
  const cachedProfile = getCachedProfile(profile.email);
  if (!cachedProfile) return profile;

  return {
    ...cachedProfile,
    ...profile,
    resume: profile.resume || cachedProfile.resume || "",
    resumePublicId: profile.resumePublicId || cachedProfile.resumePublicId || "",
  };
};
