import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Team, CreateTeam } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/teams';

  getAllTeams(): Observable<ApiResponse<Team[]>> {
    return this.http.get<ApiResponse<Team[]>>(this.apiUrl);
  }

  getTeamById(id: number): Observable<ApiResponse<Team>> {
    return this.http.get<ApiResponse<Team>>(`${this.apiUrl}/${id}`);
  }

  createTeam(team: CreateTeam): Observable<ApiResponse<Team>> {
    return this.http.post<ApiResponse<Team>>(this.apiUrl, team);
  }

  updateTeam(id: number, team: CreateTeam): Observable<ApiResponse<Team>> {
    return this.http.put<ApiResponse<Team>>(`${this.apiUrl}/${id}`, team);
  }

  deleteTeam(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }
}
