import { api, unwrap } from "./api";

export type ProfileData = {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string | null;
    phone: string | null;
    preferredLanguage: "EN" | "TA" | "EN_TA";
    organization: { id: string; name: string; code: string } | null;
    department: { id: string; name: string; code: string } | null;
  };
  academicProfile: {
    institution: string;
    domain: string;
    departmentName: string | null;
    year: string | null;
    preferredLanguage: "ENGLISH" | "TAMIL" | "TAMIL_ENGLISH";
  } | null;
  interests: string[];
  skills: Array<{ id: string; name: string; level: string; verified: boolean }>;
};

export type ProfileInput = {
  name?: string | null;
  phone?: string | null;
  firstName?: string;
  lastName?: string;
  preferredLanguage?: "EN" | "TA" | "EN_TA";
  institution: string;
  domain: "ENGINEERING" | "ARTS_SCIENCE" | "TAMIL_LANGUAGE" | "INTERDISCIPLINARY" | "OTHER";
  departmentName?: string;
  year?: "FIRST" | "SECOND" | "THIRD" | "FOURTH" | "POSTGRADUATE" | "WORKING_PROFESSIONAL" | "OTHER";
  interests: string[];
  skills: string[];
  academicPreferredLanguage?: "ENGLISH" | "TAMIL" | "TAMIL_ENGLISH";
  organizationId?: string | null;
  departmentId?: string | null;
};

export async function getProfile() {
  return unwrap<ProfileData>(api.get("/profiles/me"));
}

export async function updateProfile(input: ProfileInput) {
  return unwrap<ProfileData>(api.patch("/profiles/me", input));
}

export async function getProfileOptions(organizationId?: string) {
  return unwrap<{ organizations: Array<{ id: string; name: string; code: string }>; departments: Array<{ id: string; organizationId: string; name: string; code: string }> }>(api.get("/profiles/options", { params: { organizationId } }));
}
