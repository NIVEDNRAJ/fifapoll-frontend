import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../core/services/auth.service';
import { VoteService } from '../../core/services/vote.service';
import { SettingService } from '../../core/services/setting.service';
import { Vote, Setting } from '../../core/models/api.models';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div style="padding: 24px; max-width: 1000px; margin: 0 auto; width: 100%;">
      <!-- Welcome Header -->
      <div style="margin-bottom: 32px;">
        <h2 style="font-family: 'Outfit'; font-size: 2.2rem; font-weight: 800; margin: 0;">Dashboard</h2>
        <p style="opacity: 0.7; margin: 4px 0 0 0;">Welcome back, {{ authService.currentUser()?.name }}! Keep track of your tournament selections here.</p>
      </div>

      <!-- Main Loading Spinner -->
      <div *ngIf="isLoading()" style="display: flex; align-items: center; justify-content: center; min-height: 200px;">
        <mat-spinner [diameter]="48"></mat-spinner>
      </div>

      <!-- Dashboard Content -->
      <div *ngIf="!isLoading()" style="display: flex; flex-direction: column; gap: 24px;">
        
        <!-- Status Notification Banner -->
        <div *ngIf="settings()?.isResultPublished" class="pitch-gradient" style="color: white; padding: 20px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <div style="display: flex; align-items: center; gap: 12px;">
            <mat-icon style="font-size: 32px; width: 32px; height: 32px;" class="gold-accent">emoji_events</mat-icon>
            <div>
              <h3 style="margin: 0; font-family: 'Outfit'; font-size: 1.25rem;">Final Standings Published!</h3>
              <p style="margin: 2px 0 0 0; opacity: 0.9; font-size: 0.9rem;">The voting results are in. Head over to the Standings page to view the final rankings.</p>
            </div>
          </div>
          <button mat-raised-button color="accent" class="bg-gold" routerLink="/results">
            View Final Results
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
          <!-- Vote Status Card -->
          <mat-card style="padding: 24px; border-radius: 12px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid rgba(128,128,128,0.1);">
            <div>
              <mat-card-header style="padding: 0; margin-bottom: 20px;">
                <mat-icon style="color: var(--primary-color); font-size: 36px; width: 36px; height: 36px; margin-right: 12px;">check_circle</mat-icon>
                <mat-card-title style="font-family: 'Outfit'; font-weight: 700;">Voting Summary</mat-card-title>
              </mat-card-header>

              <!-- Voted State -->
              <div *ngIf="activeVote(); else noVoteState" style="text-align: center; padding: 16px 0;">
                <p style="opacity: 0.7; font-size: 0.95rem; margin-bottom: 12px;">Your current selected team:</p>
                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                  <img [src]="activeVote()?.flagUrl" [alt]="activeVote()?.teamName" style="width: 120px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border: 1px solid rgba(128,128,128,0.2);">
                  <span style="font-size: 1.5rem; font-weight: 800; font-family: 'Outfit';">{{ activeVote()?.teamName }}</span>
                </div>
                <p style="font-size: 0.8rem; opacity: 0.6; margin-top: 12px;">Voted at: {{ activeVote()?.votedAt | date:'medium' }}</p>
              </div>

              <!-- No Vote State -->
              <ng-template #noVoteState>
                <div style="text-align: center; padding: 24px 0; display: flex; flex-direction: column; align-items: center; gap: 12px;">
                  <mat-icon style="font-size: 48px; width: 48px; height: 48px; color: #9ca3af;">help_outline</mat-icon>
                  <p style="font-size: 1.1rem; font-weight: 600; margin: 0;">You haven't casted your vote yet!</p>
                  <p style="opacity: 0.7; font-size: 0.9rem; margin: 0; max-width: 240px;">Select your team and stand with other fans before voting closes.</p>
                </div>
              </ng-template>
            </div>

            <!-- Actions -->
            <mat-card-actions style="display: flex; flex-direction: column; gap: 8px; width: 100%; padding: 16px 0 0 0;">
              <!-- If voting enabled & not published -->
              <ng-container *ngIf="settings()?.isVotingEnabled && !settings()?.isResultPublished">
                <button *ngIf="!activeVote()" mat-raised-button color="primary" style="width: 100%; padding: 12px; font-weight: 600;" routerLink="/teams">
                  Cast Your Vote
                </button>
                <div *ngIf="activeVote()" style="display: flex; gap: 8px; width: 100%;">
                  <button mat-raised-button color="primary" style="flex: 1; padding: 12px; font-weight: 600;" routerLink="/teams">
                    Change Vote
                  </button>
                  <button mat-outlined-button color="warn" style="flex: 1; padding: 12px; font-weight: 600;" (click)="onRevoke()">
                    Revoke Vote
                  </button>
                </div>
              </ng-container>

              <!-- If voting is disabled but results not published -->
              <div *ngIf="!settings()?.isVotingEnabled && !settings()?.isResultPublished" style="text-align: center; width: 100%; padding: 8px; background-color: rgba(245,158,11,0.1); color: #b45309; border-radius: 8px; font-size: 0.85rem; font-weight: 500;">
                Voting is temporarily suspended.
              </div>

              <!-- If results are published -->
              <div *ngIf="settings()?.isResultPublished" style="text-align: center; width: 100%; padding: 8px; background-color: rgba(16,185,129,0.1); color: #047857; border-radius: 8px; font-size: 0.85rem; font-weight: 500;">
                Voting is locked. Results are final.
              </div>
            </mat-card-actions>
          </mat-card>

          <!-- System Status & News Card -->
          <mat-card style="padding: 24px; border-radius: 12px; border: 1px solid rgba(128,128,128,0.1); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <mat-card-header style="padding: 0; margin-bottom: 20px;">
                <mat-icon style="color: var(--primary-color); font-size: 36px; width: 36px; height: 36px; margin-right: 12px;">info</mat-icon>
                <mat-card-title style="font-family: 'Outfit'; font-weight: 700;">System Info</mat-card-title>
              </mat-card-header>

              <div style="display: flex; flex-direction: column; gap: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(128,128,128,0.1); padding-bottom: 8px;">
                  <span style="opacity: 0.8;">Voting Window Status</span>
                  <span style="font-weight: 600;" [style.color]="settings()?.isVotingEnabled ? '#10b981' : '#f59e0b'">
                    {{ settings()?.isVotingEnabled ? 'Open & Active' : 'Closed' }}
                  </span>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(128,128,128,0.1); padding-bottom: 8px;">
                  <span style="opacity: 0.8;">Results Status</span>
                  <span style="font-weight: 600;" [style.color]="settings()?.isResultPublished ? '#10b981' : '#6b7280'">
                    {{ settings()?.isResultPublished ? 'Published' : 'Hidden / Unreleased' }}
                  </span>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="opacity: 0.8;">User Account Type</span>
                  <span style="font-weight: 600; text-transform: uppercase;">
                    {{ authService.currentUser()?.role }}
                  </span>
                </div>
              </div>
            </div>

            <div style="margin-top: 24px; padding: 12px; background-color: rgba(15,81,50,0.05); border-left: 4px solid var(--primary-color); border-radius: 0 8px 8px 0; font-size: 0.85rem; line-height: 1.5;">
              <strong>Note:</strong> Standings and calculations are kept encrypted until voting shuts down and results are explicitly published by the platform admin.
            </div>
          </mat-card>
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
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private voteService = inject(VoteService);
  private settingService = inject(SettingService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  activeVote = signal<Vote | null>(null);
  settings = signal<Setting | null>(null);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    
    // ForkJoin-like sequencing
    this.settingService.getSettings().subscribe({
      next: (settingRes) => {
        if (settingRes.success && settingRes.data) {
          this.settings.set(settingRes.data);
        }
        
        // Fetch active vote
        this.voteService.getMyVote().subscribe({
          next: (voteRes) => {
            this.isLoading.set(false);
            if (voteRes.success && voteRes.data) {
              this.activeVote.set(voteRes.data);
            } else {
              this.activeVote.set(null);
            }
          },
          error: () => {
            this.isLoading.set(false);
          }
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Failed to load system settings.', 'Close', { duration: 4000 });
      }
    });
  }

  onRevoke(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Revoke Vote',
        message: 'Are you sure you want to revoke your vote? You will no longer have an active vote cast in the tournament standings.',
        confirmText: 'Revoke',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.isLoading.set(true);
        this.voteService.revokeVote().subscribe({
          next: (res) => {
            if (res.success) {
              this.snackBar.open(res.message, 'Close', { duration: 3000 });
              this.activeVote.set(null);
            } else {
              this.snackBar.open(res.message, 'Close', { duration: 4000 });
            }
            this.isLoading.set(false);
          },
          error: (err) => {
            this.isLoading.set(false);
            this.snackBar.open(err.message || 'Failed to revoke vote.', 'Close', { duration: 4000 });
          }
        });
      }
    });
  }
}
