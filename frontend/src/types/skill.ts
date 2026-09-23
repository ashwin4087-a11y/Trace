export type SkillPassport = {
  skills: { level: string; verified: boolean; skill: { name: string } }[];
  certificates: { 
    certificateCode: string; 
    issuedAt: string;
    user: { firstName: string; lastName: string };
    workshop: { 
      title: string; 
      department?: { organization: { name: string } };
      skills: { skill: { name: string } }[] 
    } 
  }[];
};
