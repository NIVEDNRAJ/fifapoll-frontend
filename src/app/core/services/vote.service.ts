import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Vote, VoteResult, VoterDetails } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class VoteService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/votes';

  castVote(teamId: number): Observable<ApiResponse<Vote>> {
    return this.http.post<ApiResponse<Vote>>(this.apiUrl, { teamId });
  }

  getMyVote(): Observable<ApiResponse<Vote>> {
    return this.http.get<ApiResponse<Vote>>(`${this.apiUrl}/my-vote`);
  }

  revokeVote(): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/revoke`, {});
  }

  getResults(): Observable<ApiResponse<VoteResult[]>> {
    return this.http.get<ApiResponse<VoteResult[]>>(`${this.apiUrl}/results`);
  }

  getVoterDetails(): Observable<ApiResponse<VoterDetails[]>> {
    return this.http.get<ApiResponse<VoterDetails[]>>(`${this.apiUrl}/voters`);
  }
}
