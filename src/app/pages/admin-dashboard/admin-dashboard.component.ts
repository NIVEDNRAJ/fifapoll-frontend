import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SettingService } from '../../core/services/setting.service';
import { VoteService } from '../../core/services/vote.service';
import { Setting } from '../../core/models/api.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div style="padding: 24px; max-width: 900px; margin: 0 auto; width: 100%;">
      <!-- Header -->
      <div style="margin-bottom: 32px;">
        <h2 style="font-family: 'Outfit'; font-size: 2.2rem; font-weight: 800; margin: 0;">Admin Dashboard</h2>
        <p style="opacity: 0.7; margin: 4px 0 0 0;">Manage global settings, toggle polling windows, and view overall statistics.</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" style="display: flex; align-items: center; justify-content: center; min-height: 200px;">
        <mat-spinner [diameter]="48"></mat-spinner>
      </div>

      <div *ngIf="!isLoading()" style="display: flex; flex-direction: column; gap: 24px;">
        
        <!-- Stats Row -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px;">
          <!-- Stat Card 1 -->
          <mat-card style="padding: 24px; border-radius: 12px; border: 1px solid rgba(128,128,128,0.1); text-align: center;">
            <mat-icon style="font-size: 36px; width: 36px; height: 36px; color: var(--primary-color); margin: 0 auto 12px auto;">people</mat-icon>
            <span style="font-size: 0.85rem; text-transform: uppercase; font-weight: bold; opacity: 0.6; letter-spacing: 1px;">Registered Voters</span>
            <h3 style="font-family: 'Outfit'; font-size: 2.5rem; font-weight: 800; margin: 4px 0 0 0;">{{ voterCount() }}</h3>
          </mat-card>

          <!-- Stat Card 2 -->
          <mat-card style="padding: 24px; border-radius: 12px; border: 1px solid rgba(128,128,128,0.1); text-align: center;">
            <mat-icon style="font-size: 36px; width: 36px; height: 36px; color: var(--primary-color); margin: 0 auto 12px auto;">how_to_vote</mat-icon>
            <span style="font-size: 0.85rem; text-transform: uppercase; font-weight: bold; opacity: 0.6; letter-spacing: 1px;">Votes Cast</span>
            <h3 style="font-family: 'Outfit'; font-size: 2.5rem; font-weight: 800; margin: 4px 0 0 0;">{{ castCount() }}</h3>
          </mat-card>

          <!-- Stat Card 3 -->
          <mat-card style="padding: 24px; border-radius: 12px; border: 1px solid rgba(128,128,128,0.1); text-align: center;">
            <mat-icon style="font-size: 36px; width: 36px; height: 36px; color: #fbbf24; margin: 0 auto 12px auto;">pending_actions</mat-icon>
            <span style="font-size: 0.85rem; text-transform: uppercase; font-weight: bold; opacity: 0.6; letter-spacing: 1px;">Participation Rate</span>
            <h3 style="font-family: 'Outfit'; font-size: 2.5rem; font-weight: 800; margin: 4px 0 0 0;">{{ participationRate() }}%</h3>
          </mat-card>
        </div>

        <!-- Controls Section -->
        <mat-card style="padding: 28px; border-radius: 16px; border: 1px solid rgba(128,128,128,0.15);">
          <mat-card-header style="padding: 0; margin-bottom: 24px;">
            <mat-icon style="color: var(--primary-color); font-size: 32px; width: 32px; height: 32px; margin-right: 12px;">settings</mat-icon>
            <mat-card-title style="font-family: 'Outfit'; font-weight: 800; font-size: 1.4rem;">Voting Settings</mat-card-title>
          </mat-card-header>

          <mat-card-content style="display: flex; flex-direction: column; gap: 24px; padding: 0;">
            <!-- Control 1 -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; border-bottom: 1px solid rgba(128,128,128,0.1); padding-bottom: 20px;">
              <div style="max-width: 480px;">
                <h4 style="margin: 0 0 4px 0; font-family: 'Outfit'; font-weight: bold; font-size: 1.1rem;">Enable/Disable Voting</h4>
                <p style="margin: 0; opacity: 0.7; font-size: 0.9rem; line-height: 1.4;">
                  Toggle this setting to open or close the voting window for general users. When disabled, users cannot cast new votes or modify existing ones.
                </p>
              </div>
              <mat-slide-toggle [checked]="settings()?.isVotingEnabled" (change)="toggleVoting($event.checked)" color="primary" style="transform: scale(1.1);">
                <span style="font-weight: 600;">{{ settings()?.isVotingEnabled ? 'ACTIVE' : 'SUSPENDED' }}</span>
              </mat-slide-toggle>
            </div>

            <!-- Control 2 -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; padding-top: 4px;">
              <div style="max-width: 480px;">
                <h4 style="margin: 0 0 4px 0; font-family: 'Outfit'; font-weight: bold; font-size: 1.1rem;">Publish Poll Results</h4>
                <p style="margin: 0; opacity: 0.7; font-size: 0.9rem; line-height: 1.4;">
                  Toggle this setting to reveal standings to the public. If enabled, voting is automatically locked to preserve final rankings.
                </p>
              </div>
              <mat-slide-toggle [checked]="settings()?.isResultPublished" (change)="toggleResults($event.checked)" color="primary" style="transform: scale(1.1);">
                <span style="font-weight: 600;">{{ settings()?.isResultPublished ? 'PUBLISHED' : 'HIDDEN' }}</span>
              </mat-slide-toggle>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Shortcut Panel -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
          <button mat-raised-button color="primary" style="padding: 16px; font-family: 'Outfit'; font-weight: bold;" routerLink="/admin-teams">
            <mat-icon style="margin-right: 8px;">flag</mat-icon> Manage Teams (CRUD)
          </button>
          <button mat-raised-button color="primary" style="padding: 16px; font-family: 'Outfit'; font-weight: bold;" routerLink="/admin-votes">
            <mat-icon style="margin-right: 8px;">assessment</mat-icon> Audit User Votes
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private settingService = inject(SettingService);
  private voteService = inject(VoteService);
  private snackBar = inject(MatSnackBar);

  settings = signal<Setting | null>(null);
  voterCount = signal<number>(0);
  castCount = signal<number>(0);
  isLoading = signal<boolean>(true);

  // Computeds
  participationRate = computed(() => {
    const total = this.voterCount();
    const cast = this.castCount();
    if (total === 0) return 0;
    return Math.round((cast / total) * 100);
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.settingService.getSettings().subscribe({
      next: (settingRes) => {
        if (settingRes.success && settingRes.data) {
          this.settings.set(settingRes.data);
        }

        // Fetch Audit List to get counts
        this.voteService.getVoterDetails().subscribe({
          next: (voteRes) => {
            this.isLoading.set(false);
            if (voteRes.success && voteRes.data) {
              const voters = voteRes.data;
              this.voterCount.set(voters.length);
              this.castCount.set(voters.filter(v => v.hasVoted).length);
            }
          },
          error: () => this.isLoading.set(false)
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Error fetching settings.', 'Close', { duration: 4000 });
      }
    });
  }

  toggleVoting(enabled: boolean): void {
    if (!this.settings()) return;
    
    const updated: Setting = {
      isVotingEnabled: enabled,
      isResultPublished: this.settings()!.isResultPublished
    };

    this.updateSettings(updated);
  }

  toggleResults(published: boolean): void {
    if (!this.settings()) return;

    // Business rule: If results are published, voting is locked (disabled).
    // Let's enforce that automatically for convenience.
    const updated: Setting = {
      isVotingEnabled: published ? false : this.settings()!.isVotingEnabled,
      isResultPublished: published
    };

    this.updateSettings(updated);
  }

  private updateSettings(updated: Setting): void {
    this.isLoading.set(true);
    this.settingService.updateSettings(updated).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.settings.set(res.data);
          this.snackBar.open(res.message, 'Close', { duration: 3000 });
          // If we locked voting due to publishing, update counts/refresh UI
          this.loadData();
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.snackBar.open(err.message || 'Failed to update settings.', 'Close', { duration: 4000 });
      }
    });
  }
}
