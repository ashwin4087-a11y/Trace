import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const BASE_URL = "http://127.0.0.1:4000/api";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@aurex.local";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "lksNhxCpJR5Yy7Rmol+zEd7XEUGpTf0ZK7AozKzs8/U=";

const ORGANIZER_EMAIL = process.env.SEED_ORGANIZER_EMAIL || "organizer@aurex.local";
const ORGANIZER_PASSWORD = process.env.SEED_ORGANIZER_PASSWORD || "yUd+F5/LkVjoCAMPR16JGu+MStkfc8pkZFiSy1VpYRs=";

const PARTICIPANT_EMAIL = process.env.SEED_PARTICIPANT_EMAIL || "participant@aurex.local";
const PARTICIPANT_PASSWORD = process.env.SEED_PARTICIPANT_PASSWORD || "lIiIen2ktLnTU5+r3OOmxfgElUCwtjVKjmmvTlffH3s=";

async function request(endpoint: string, method = "GET", body?: any, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(`[${method} ${endpoint}] Failed (${res.status}): ${JSON.stringify(json)}`);
  }
  return json;
}

async function runE2EValidation() {
  console.log("=== STARTING FULL END-TO-END WORKFLOW INTEGRATION VERIFICATION ===");

  // STEP 1: ADMIN LOGIN
  console.log("\n1. Admin Authentication");
  const adminAuth = await request("/auth/login", "POST", {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  const adminToken = adminAuth.data.accessToken;
  console.log(`✓ Admin logged in successfully (User ID: ${adminAuth.data.user.id})`);

  // STEP 2: CREATE ORGANIZATION & DEPARTMENT
  console.log("\n2. Organization & Department Setup");
  const orgCode = `ORG_${Date.now()}`;
  const org = await request("/organizations", "POST", {
    name: "AUREX Test Academy",
    code: orgCode,
    description: "Automated test organization",
  }, adminToken);
  console.log(`✓ Created Organization: ${org.data.name} (${org.data.id})`);

  const dept = await request("/departments", "POST", {
    organizationId: org.data.id,
    name: "Software Engineering",
    code: `SE_${Date.now()}`,
  }, adminToken);
  console.log(`✓ Created Department: ${dept.data.name} (${dept.data.id})`);

  // STEP 3: ORGANIZER LOGIN & WORKSHOP CREATION
  console.log("\n3. Organizer Workflow — Create & Publish Workshop");
  const organizerAuth = await request("/auth/login", "POST", {
    email: ORGANIZER_EMAIL,
    password: ORGANIZER_PASSWORD,
  });
  const organizerToken = organizerAuth.data.accessToken;
  console.log(`✓ Organizer logged in successfully`);

  const workshopSlug = `e2e-workshop-${Date.now()}`;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 2);

  const workshop = await request("/workshops", "POST", {
    title: "E2E Automated Integration Workshop",
    slug: workshopSlug,
    description: "Full workflow test workshop",
    shortDescription: "E2E Test",
    category: "Cybersecurity",
    domain: "ENGINEERING",
    level: "BEGINNER",
    trainerName: "Meena Organizer",
    language: "EN_TA",
    registrationDeadline: startDate.toISOString(),
    meetingUrl: "https://meet.google.com/aurex-e2e-demo",
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    durationHours: 10,
    mode: "ONLINE",
    capacity: 50,
    priceCents: 0,
    currency: "INR",
    certificateEnabled: true,
  }, organizerToken);
  const workshopId = workshop.data.id;
  console.log(`✓ Created Workshop: ${workshop.data.title} (${workshopId})`);

  // Publish Workshop
  const published = await request(`/workshops/${workshopId}/publish`, "POST", {}, organizerToken);
  console.log(`✓ Published Workshop Status: ${published.data.status}`);

  // CREATE SESSION
  console.log("\n4. Session & Content Creation");
  const sessionStart = new Date(startDate);
  sessionStart.setHours(10, 0, 0, 0);
  const sessionEnd = new Date(sessionStart);
  sessionEnd.setHours(13, 0, 0, 0);

  const session = await request("/sessions", "POST", {
    workshopId,
    title: "Session 1: Architecture & Hands-on Lab",
    sessionDate: sessionStart.toISOString(),
    startTime: sessionStart.toISOString(),
    endTime: sessionEnd.toISOString(),
    mode: "ONLINE",
    meetingUrl: "https://meet.google.com/aurex-e2e-lab",
  }, organizerToken);
  const sessionId = session.data.id;
  console.log(`✓ Created Session: ${session.data.title} (${sessionId})`);

  // CREATE LEARNING MATERIAL
  const material = await request(`/learning/workshops/${workshopId}`, "POST", {
    sessionId,
    title: "Lab Handout PDF",
    description: "Overview document",
    type: "PDF",
    url: "https://aurex.local/docs/lab1.pdf",
  }, organizerToken);
  const materialId = material.data.id;
  await request(`/learning/${materialId}/publish`, "POST", {}, organizerToken);
  console.log(`✓ Created & Published Learning Material: ${material.data.title}`);

  // CREATE ACTIVITY
  const activity = await request(`/activities/workshops/${workshopId}`, "POST", {
    workshopId,
    sessionId,
    title: "Practical Command-line Exercise",
    description: "Complete exercise task",
    type: "PRACTICAL_TASK",
    submissionType: "TEXT",
  }, organizerToken);
  const activityId = activity.data.id;
  await request(`/activities/${activityId}/publish`, "POST", {}, organizerToken);
  console.log(`✓ Created & Published Activity: ${activity.data.title} (${activityId})`);

  // CREATE ASSESSMENT & QUESTIONS
  const assessment = await request(`/assessments/workshops/${workshopId}/assessments`, "POST", {
    workshopId,
    sessionId,
    title: "Session 1 Knowledge Check Quiz",
    description: "Assessment quiz",
    type: "QUIZ",
    passScore: 50,
  }, organizerToken);
  const assessmentId = assessment.data.id;

  const question = await request(`/assessments/assessments/${assessmentId}/questions`, "POST", {
    prompt: "Which command lists directory contents in Linux?",
    type: "MCQ_SINGLE",
    options: ["ls", "cd", "pwd", "mkdir"],
    correctIndex: 0,
    points: 100,
    sortOrder: 1,
  }, organizerToken);
  console.log(`✓ Created Assessment & Question: ${question.data.prompt}`);

  await request(`/assessments/assessments/${assessmentId}/publish`, "POST", {}, organizerToken);
  console.log(`✓ Published Assessment Quiz`);

  // STEP 5: PARTICIPANT FLOW
  console.log("\n5. Participant Workflow — Registration, Learning, Assessment & Submissions");
  const participantAuth = await request("/auth/login", "POST", {
    email: PARTICIPANT_EMAIL,
    password: PARTICIPANT_PASSWORD,
  });
  const participantToken = participantAuth.data.accessToken;
  const participantId = participantAuth.data.user.id;
  console.log(`✓ Participant logged in successfully (${participantId})`);

  // Register for Workshop
  const reg = await request("/registrations", "POST", {
    workshopId,
  }, participantToken);
  const registrationId = reg.data.id;
  console.log(`✓ Registered for Workshop (Status: ${reg.data.status}, RegID: ${registrationId})`);

  // View Learning Materials
  const materialsList = await request(`/learning/workshops/${workshopId}`, "GET", undefined, participantToken);
  console.log(`✓ Retrieved ${materialsList.data.length} Published Materials for Participant`);

  // Submit Activity
  const submission = await request(`/activities/${activityId}/submission`, "POST", {
    textContent: "Completed all command exercises successfully in the terminal.",
  }, participantToken);
  console.log(`✓ Submitted Activity Submission (Status: ${submission.data.status})`);

  // Take Assessment Quiz
  const attempt = await request(`/assessments/assessments/${assessmentId}/attempts`, "POST", {}, participantToken);
  const attemptId = attempt.data.id;
  console.log(`✓ Started Assessment Attempt (${attemptId})`);

  const quizResult = await request(`/assessments/assessment-attempts/${attemptId}/submit`, "POST", {
    answers: [
      { questionId: question.data.id, selectedOptionIndex: 0 }
    ]
  }, participantToken);
  console.log(`✓ Submitted Assessment Quiz (Score: ${quizResult.data.percentage}%, Passed: ${quizResult.data.passed})`);

  // STEP 6: ATTENDANCE & QR CODE
  console.log("\n6. QR Attendance & Eligibility");
  const qrData = await request(`/attendance/sessions/${sessionId}/attendance/qr/generate`, "POST", {}, organizerToken);
  const rawQrToken = qrData.data.token || qrData.data.qrToken;
  console.log(`✓ Organizer generated Session QR Token: ${rawQrToken.substring(0, 15)}...`);

  const attendanceScan = await request("/attendance/qr", "POST", {
    token: rawQrToken,
  }, participantToken);
  console.log(`✓ Participant scanned QR Token (Attendance Status: ${attendanceScan.data.status})`);

  // STEP 7: CERTIFICATE GENERATION & VERIFICATION
  console.log("\n7. Certificate Generation & Public Verification");
  const eligibility = await request(`/certificates/workshops/${workshopId}/registrations/${registrationId}/eligibility`, "GET", undefined, participantToken);
  console.log(`✓ Certificate Eligibility check: ${eligibility.data.eligible} (Attendance: ${eligibility.data.percentage}%)`);

  const cert = await request(`/certificates/workshops/${workshopId}/generate`, "POST", {
    participantId,
  }, organizerToken);
  const certCode = cert.data.certificateCode;
  console.log(`✓ Issued Certificate! Code: ${certCode}, Status: ${cert.data.status}`);

  // Public Verification
  const verification = await request(`/certificates/verify/${certCode}`, "GET");
  console.log(`✓ Public Verification API Response: Valid Certificate (Code: ${verification.data.certificateCode})`);

  console.log("\n==============================================================");
  console.log(" SUCCESS! ALL END-TO-END LMS WORKFLOWS ARE FULLY VERIFIED!");
  console.log("==============================================================");
}

runE2EValidation().catch((err) => {
  console.error("\n❌ E2E VERIFICATION FAILED:", err);
  process.exit(1);
});
