export interface Member {
  id: string;
  name: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  status: string;
}

export interface Mission {
  day: number;
  title: string;
  passed: boolean;
  skipped: boolean;
  attempts: number;
}

export interface Signals {
  commitDays: number;
  missionsCompleted: number;
  missionsFirstTry: number;
}

export interface Candidate {
  member: Member;
  missions: Mission[];
  signals: Signals;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface Session {
  candidate: Candidate;
  history: ChatMessage[];
  turnCount: number;
  done: boolean;
  createdAt: number;
}

// In-memory session store keyed by sessionId. No DB needed.
const sessions = new Map<string, Session>();

export function createSession(sessionId: string, candidate: Candidate): Session {
  const session: Session = {
    candidate,
    history: [],
    turnCount: 0,
    done: false,
    createdAt: Date.now(),
  };
  sessions.set(sessionId, session);
  return session;
}

export function getSession(sessionId: string): Session | null {
  return sessions.get(sessionId) || null;
}

export function updateSession(
  sessionId: string,
  updater: (session: Session) => void
): Session | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  updater(session);
  return session;
}

export function deleteSession(sessionId: string): boolean {
  return sessions.delete(sessionId);
}

export function getAllSessions(): Map<string, Session> {
  return sessions;
}