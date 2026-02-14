export interface User {
  id: string; // uuid
  email: string;
  passwordHash: string;
  nome: string;
  cognome: string;
  isAdmin?: boolean; // Flag per identificare gli amministratori
}

export interface Event {
  id: string; // uuid
  creatorId: string; // uuid
  title: string;
  description: string;
  date: string; // ISO8601 (YYYY-MM-DD)
  time: string; // HH:mm
}

export interface Participant {
  eventId: string; // uuid
  userId: string; // uuid
  timestamp: string; // ISO8601
}
