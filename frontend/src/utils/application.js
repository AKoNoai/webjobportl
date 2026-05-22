import { apiUrl } from "./api";

const STORAGE_USER_KEY = "jobportal_user";

export const isAlreadyAppliedMessage = (message = "") =>
  /already applied|đã nộp đơn cho công việc này rồi/i.test(message);

export const getApplicationProfileStatus = async (token) => {
  if (!token) {
    return {
      canApply: false,
      message: "Please login to apply.",
    };
  }

  try {
    const res = await fetch(apiUrl("/user/profile"), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!data.success) {
      return {
        canApply: false,
        message: data.message || "Unable to verify your profile.",
      };
    }

    const cachedUser = JSON.parse(localStorage.getItem(STORAGE_USER_KEY) || "{}");
    const profilePhone = data.user?.phone || cachedUser.phone || "";
    const profileResume = data.user?.resume || cachedUser.resume || "";
    const profileResumePublicId = data.user?.resumePublicId || cachedUser.resumePublicId || "";

    if (!profilePhone || (!profileResume && !profileResumePublicId)) {
      return {
        canApply: false,
        message: "Please complete your profile (add phone and resume) before applying.",
      };
    }

    return {
      canApply: true,
      profilePhone,
      profileResume,
      profileResumePublicId,
    };
  } catch {
    return {
      canApply: false,
      message: "Unable to verify your profile. Please try again.",
    };
  }
};