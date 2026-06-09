import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { VoteService } from '../../core/services/vote.service';
import { SettingService } from '../../core/services/setting.service';
import { Vote, Setting } from '../../core/models/api.models';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-my-vote',
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
    <div style="padding: 24px; max-width: 600px; margin: 0 auto; width: 100%;">
      <!-- Header -->
      <div style="margin-bottom: 32px; text-align: center;">
        <h2 style="font-family: 'Outfit'; font-size: 2.2rem; font-weight: 800; margin: 0;">My Active Vote</h2>
        <p style="opacity: 0.7; margin: 4px 0 0 0;">Inspect your submitted vote and manage your selection.</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" style="display: flex; align-items: center; justify-content: center; min-height: 200px;">
        <mat-spinner [diameter]="48"></mat-spinner>
      </div>

      <div *ngIf="!isLoading()">
        
        <!-- Active Vote Details -->
        <mat-card *ngIf="activeVote(); else emptyState" 
                  style="border-radius: 16px; overflow: hidden; border: 1px solid rgba(128,128,128,0.15); box-shadow: 0 4px 20px rgba(0,0,0,0.05); padding: 0;">
          
          <!-- Flag Header -->
          <div style="height: 220px; overflow: hidden; background-color: rgba(128,128,128,0.05); display: flex; align-items: center; justify-content: center; position: relative;">
            <img [src]="activeVote()!.flagUrl" [alt]="activeVote()!.teamName" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; bottom: 12px; right: 12px; background-color: rgba(0,0,0,0.8); color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 0.95rem;">
              {{ activeVote()!.countryCode }}
            </span>
          </div>

          <!-- Content Details -->
          <div style="padding: 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.6; font-weight: 600;">Selected Team</span>
              <h3 style="font-family: 'Outfit'; font-size: 2.2rem; font-weight: 800; margin: 4px 0 0 0; line-height: 1;">{{ activeVote()!.teamName }}</h3>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; padding: 16px; background-color: rgba(128,128,128,0.05); border-radius: 8px; font-size: 0.9rem;">
              <div style="display: flex; justify-content: space-between;">
                <span style="opacity: 0.7;">Vote ID</span>
                <span style="font-weight: 500;">#{{ activeVote()!.id }}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="opacity: 0.7;">Voted Date</span>
                <span style="font-weight: 500;">{{ activeVote()!.votedAt | date:'medium' }}</span>
              </div>
              <div *ngIf="activeVote()!.updatedAt" style="display: flex; justify-content: space-between;">
                <span style="opacity: 0.7;">Last Updated</span>
                <span style="font-weight: 500;">{{ activeVote()!.updatedAt | date:'medium' }}</span>
              </div>
            </div>

            <!-- Lock Message -->
            <div *ngIf="settings()?.isResultPublished" style="margin-bottom: 16px; padding: 12px; border-radius: 8px; font-size: 0.85rem; text-align: center; background-color: rgba(16,185,129,0.1); color: #047857; font-weight: 500;">
              Voting is closed. This selection is finalized.
            </div>

            <!-- Suspended Message -->
            <div *ngIf="!settings()?.isResultPublished && !settings()?.isVotingEnabled" style="margin-bottom: 16px; padding: 12px; border-radius: 8px; font-size: 0.85rem; text-align: center; background-color: rgba(245,158,11,0.1); color: #b45309; font-weight: 500;">
              Voting changes are temporarily locked.
            </div>

            <!-- Management Buttons -->
            <div *ngIf="settings()?.isVotingEnabled && !settings()?.isResultPublished" style="display: flex; gap: 16px; width: 100%;">
              <button mat-raised-button color="primary" style="flex: 1; padding: 12px; font-weight: 600;" routerLink="/teams">
                Change Vote
              </button>
              <button mat-outlined-button color="warn" style="flex: 1; padding: 12px; font-weight: 600;" (click)="onRevoke()">
                Revoke Vote
              </button>
            </div>
          </div>
        </mat-card>

        <!-- Empty State -->
        <ng-template #emptyState>
          <mat-card style="border-radius: 16px; padding: 48px 24px; text-align: center; border: 1px solid rgba(128,128,128,0.15);">
            <mat-icon style="font-size: 64px; width: 64px; height: 64px; color: #9ca3af; margin-bottom: 16px;">warning_amber</mat-icon>
            <h3 style="font-family: 'Outfit'; font-size: 1.6rem; font-weight: bold; margin: 0 0 8px 0;">No Vote Recorded</h3>
            <p style="opacity: 0.7; max-width: 300px; margin: 0 auto 24px auto; line-height: 1.5;">You have not cast an active vote in the FIFA tournament polls yet.</p>
            
            <button *ngIf="settings()?.isVotingEnabled" mat-raised-button color="primary" routerLink="/teams" style="padding: 10px 24px; font-weight: 600;">
              View Teams & Vote
            </button>
            <div *ngIf="!settings()?.isVotingEnabled" style="padding: 8px 16px; border-radius: 8px; background-color: rgba(128,128,128,0.05); font-size: 0.9rem; display: inline-block;">
              Voting is closed.
            </div>
          </mat-card>
        </ng-template>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MyVoteComponent implements OnInit {
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
    this.settingService.getSettings().subscribe({
      next: (settingRes) => {
        if (settingRes.success && settingRes.data) {
          this.settings.set(settingRes.data);
        }

        this.voteService.getMyVote().subscribe({
          next: (voteRes) => {
            this.isLoading.set(false);
            if (voteRes.success && voteRes.data) {
              this.activeVote.set(voteRes.data);
            } else {
              this.activeVote.set(null);
            }
          },
          error: () => this.isLoading.set(false)
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Error fetching configurations.', 'Close', { duration: 4000 });
      }
    });
  }

  onRevoke(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Revoke Vote',
        message: 'Are you sure you want to revoke your vote? This action clears your selected team from standings.',
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
