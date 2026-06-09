import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { SettingService } from '../../core/services/setting.service';
import { Setting } from '../../core/models/api.models';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div style="display: flex; flex-direction: column; min-height: calc(100vh - 64px);">
      <!-- Hero Banner -->
      <section class="pitch-gradient" style="color: white; padding: 64px 24px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px;">
        <mat-icon style="font-size: 80px; width: 80px; height: 80px;" class="gold-accent">emoji_events</mat-icon>
        <h1 style="font-family: 'Outfit'; font-size: 3.5rem; font-weight: 800; line-height: 1.1; margin: 0; letter-spacing: -1px;">
          FIFA WORLD CUP <br>
          <span class="gold-accent">POLLING SYSTEM</span>
        </h1>
        <p style="font-size: 1.25rem; max-width: 600px; margin: 0; opacity: 0.9; font-weight: 300;">
          Make your voice heard! Vote for your favorite national team, track live polling standings, and see who reigns supreme.
        </p>

        <!-- Dynamic Status Alerts -->
        <div style="margin: 16px 0; padding: 12px 24px; border-radius: 30px; background-color: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); font-weight: 500; display: flex; align-items: center; gap: 8px;">
          <span class="gold-accent" style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: #fbbf24;" [style.background-color]="statusColor()"></span>
          {{ statusText() }}
        </div>

        <div style="display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 16px; flex-wrap: wrap;">
          <ng-container *ngIf="authService.isAuthenticated(); else authButtons">
            <a routerLink="/dashboard" style="text-decoration: none;">
              <button style="background-color: #fbbf24; color: #062214; border: none; padding: 12px 28px; font-size: 1.05rem; font-family: 'Outfit'; font-weight: bold; border-radius: 30px; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
                Go to Dashboard <mat-icon style="font-size: 20px; width: 20px; height: 20px;">arrow_forward</mat-icon>
              </button>
            </a>
          </ng-container>
          <ng-template #authButtons>
            <a routerLink="/login" style="text-decoration: none;">
              <button style="background-color: #fbbf24; color: #062214; border: none; padding: 12px 28px; font-size: 1.05rem; font-family: 'Outfit'; font-weight: 700; border-radius: 30px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
                Sign In to Vote
              </button>
            </a>
            <a routerLink="/register" style="text-decoration: none;">
              <button style="background-color: transparent; color: white; border: 2px solid white; padding: 10px 26px; font-size: 1.05rem; font-family: 'Outfit'; font-weight: 700; border-radius: 30px; cursor: pointer;">
                Create Account
              </button>
            </a>
          </ng-template>
        </div>
      </section>

      <!-- Info Cards -->
      <section style="flex: 1; padding: 48px 24px; max-width: 1200px; margin: 0 auto; width: 100%;">
        <h2 style="font-family: 'Outfit'; font-size: 2.2rem; font-weight: 800; text-align: center; margin-bottom: 36px; letter-spacing: -0.5px;">How It Works</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
          <mat-card class="card-hover" style="padding: 24px; border-radius: 12px; border: 1px solid rgba(128,128,128,0.1);">
            <mat-card-header style="margin-bottom: 16px;">
              <mat-icon style="font-size: 40px; width: 40px; height: 40px; color: var(--primary-color);">how_to_reg</mat-icon>
              <mat-card-title style="font-family: 'Outfit'; font-weight: bold; font-size: 1.3rem;">1. Secure Register</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p style="opacity: 0.8; line-height: 1.6;">Create an account with email verification and secure password hashes to join the official fan poll.</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="card-hover" style="padding: 24px; border-radius: 12px; border: 1px solid rgba(128,128,128,0.1);">
            <mat-card-header style="margin-bottom: 16px;">
              <mat-icon style="font-size: 40px; width: 40px; height: 40px; color: var(--primary-color);">sports_soccer</mat-icon>
              <mat-card-title style="font-family: 'Outfit'; font-weight: bold; font-size: 1.3rem;">2. Cast & Modify Vote</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p style="opacity: 0.8; line-height: 1.6;">Browse competing nations and cast your vote. You can revoke or change your vote at any time before results are published.</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="card-hover" style="padding: 24px; border-radius: 12px; border: 1px solid rgba(128,128,128,0.1);">
            <mat-card-header style="margin-bottom: 16px;">
              <mat-icon style="font-size: 40px; width: 40px; height: 40px; color: var(--primary-color);">analytics</mat-icon>
              <mat-card-title style="font-family: 'Outfit'; font-weight: bold; font-size: 1.3rem;">3. Official Standings</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p style="opacity: 0.8; line-height: 1.6;">Standings and vote counts remain encrypted and hidden. Once the administrator publishes results, the final rankings are revealed!</p>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <!-- Footer -->
      <footer style="padding: 24px; text-align: center; border-top: 1px solid rgba(128,128,128,0.1); font-size: 0.9rem; opacity: 0.7;">
        &copy; 2026 FIFA World Cup Polling System. Built with ASP.NET Core & Angular.
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LandingComponent implements OnInit {
  authService = inject(AuthService);
  private settingService = inject(SettingService);

  settings = signal<Setting | null>(null);
  statusText = signal<string>('Loading system status...');
  statusColor = signal<string>('#9ca3af');

  ngOnInit(): void {
    this.settingService.getSettings().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.settings.set(res.data);
          this.updateStatus(res.data);
        }
      },
      error: () => {
        this.statusText.set('Offline - Connection error');
        this.statusColor.set('#ef4444');
      }
    });
  }

  private updateStatus(settings: Setting): void {
    if (settings.isResultPublished) {
      this.statusText.set('Final Standings Published');
      this.statusColor.set('#10b981'); // Green
    } else if (settings.isVotingEnabled) {
      this.statusText.set('Voting is Open & Live');
      this.statusColor.set('#3b82f6'); // Blue
    } else {
      this.statusText.set('Voting is Closed');
      this.statusColor.set('#f59e0b'); // Yellow/Orange
    }
  }
}
