import type { ActivityType, SubmissionType, SubmissionStatus, ActivityStatus } from "@prisma/client";

export type CreateActivityInput = {
  workshopId: string;
  sessionId?: string;
  title: string;
  description: string;
  instructions?: string;
  type: ActivityType;
  isRequired: boolean;
  dueAt?: string;
  maxScore?: number;
  submissionType: SubmissionType;
  resourceUrl?: string;
};

export type UpdateActivityInput = Partial<Omit<CreateActivityInput, "workshopId">> & {
  status?: ActivityStatus;
};

export type ReorderActivityInput = {
  id: string;
  sortOrder: number;
}[];

export type SubmitActivityInput = {
  textContent?: string;
  submissionUrl?: string;
};

export type ReviewSubmissionInput = {
  status: SubmissionStatus;
  score?: number;
  feedback?: string;
};
