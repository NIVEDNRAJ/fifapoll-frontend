import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Setting } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/settings';

  getSettings(): Observable<ApiResponse<Setting>> {
    return this.http.get<ApiResponse<Setting>>(this.apiUrl);
  }

  updateSettings(settings: Setting): Observable<ApiResponse<Setting>> {
    return this.http.put<ApiResponse<Setting>>(this.apiUrl, settings);
  }
}
