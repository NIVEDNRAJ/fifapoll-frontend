export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface User {
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  role: string;
}

export interface Team {
  id: number;
  teamName: string;
  countryCode: string;
  flagUrl: string;
}

export interface CreateTeam {
  teamName: string;
  countryCode: string;
  flagUrl: string;
}

export interface Vote {
  id: number;
  userId: number;
  teamId: number;
  teamName: string;
  countryCode: string;
  flagUrl: string;
  isActive: boolean;
  votedAt: string;
  updatedAt?: string;
}

export interface VoteResult {
  teamId: number;
  teamName: string;
  countryCode: string;
  flagUrl: string;
  voteCount: number;
  percentage: number;
}

export interface VoterDetails {
  userId: number;
  userName: string;
  userEmail: string;
  hasVoted: boolean;
  votedTeamId?: number;
  votedTeamName: string;
  votedAt?: string;
}

export interface Setting {
  isVotingEnabled: boolean;
  isResultPublished: boolean;
}
