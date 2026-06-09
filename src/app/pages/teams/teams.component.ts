import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TeamService } from '../../core/services/team.service';
import { VoteService } from '../../core/services/vote.service';
import { SettingService } from '../../core/services/setting.service';
import { Team, Vote, Setting } from '../../core/models/api.models';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div style="padding: 24px; max-width: 1200px; margin: 0 auto; width: 100%;">
      <!-- Header Section -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 32px;">
        <div>
          <h2 style="font-family: 'Outfit'; font-size: 2.2rem; font-weight: 800; margin: 0;">World Cup Teams</h2>
          <p style="opacity: 0.7; margin: 4px 0 0 0;">View competing countries, learn their codes, and place your official vote.</p>
        </div>

        <!-- Search Field -->
        <mat-form-field appearance="outline" style="min-width: 280px; width: 100%; max-width: 360px;">
          <mat-label>Search country or code...</mat-label>
          <input matInput (input)="onSearch($event)" placeholder="e.g. Argentina or ARG">
          <mat-icon matPrefix style="margin-right: 8px; opacity: 0.6;">search</mat-icon>
        </mat-form-field>
      </div>

      <!-- Settings Notifications -->
      <div *ngIf="settings() && (!settings()!.isVotingEnabled || settings()!.isResultPublished)" style="margin-bottom: 24px; padding: 16px; border-radius: 8px; font-weight: 500; font-size: 0.95rem; display: flex; align-items: center; gap: 8px;"
           [style.background-color]="settings()!.isResultPublished ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)'"
           [style.color]="settings()!.isResultPublished ? '#047857' : '#b45309'">
        <mat-icon>{{ settings()!.isResultPublished ? 'lock' : 'warning' }}</mat-icon>
        <span>
          {{ settings()!.isResultPublished ? 'Voting is closed and locked because results are published.' : 'Voting is currently disabled by the administrator.' }}
        </span>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; gap: 16px;">
        <mat-spinner [diameter]="48"></mat-spinner>
        <span style="opacity: 0.7; font-size: 0.95rem;">Loading teams...</span>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && filteredTeams().length === 0" style="text-align: center; padding: 64px 24px; opacity: 0.7;">
        <mat-icon style="font-size: 56px; width: 56px; height: 56px; margin-bottom: 16px;">search_off</mat-icon>
        <h3 style="font-family: 'Outfit'; font-size: 1.5rem; font-weight: bold; margin: 0 0 8px 0;">No Teams Found</h3>
        <p style="margin: 0;">Try searching for a different name or 3-letter country code.</p>
      </div>

      <!-- Teams Grid -->
      <div *ngIf="!isLoading() && filteredTeams().length > 0" 
           style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px;">
        
        <mat-card *ngFor="let team of filteredTeams()" class="card-hover" 
                  style="border-radius: 12px; overflow: hidden; border: 1px solid rgba(128,128,128,0.15); display: flex; flex-direction: column; justify-content: space-between;"
                  [style.border-color]="isCurrentVote(team.id) ? 'var(--primary-color)' : 'rgba(128,128,128,0.15)'"
                  [style.box-shadow]="isCurrentVote(team.id) ? '0 0 12px rgba(15,81,50,0.15)' : 'none'">
          
          <div>
            <!-- Flag Area -->
            <div style="position: relative; height: 140px; overflow: hidden; background-color: rgba(128,128,128,0.05); border-bottom: 1px solid rgba(128,128,128,0.1); display: flex; align-items: center; justify-content: center;">
              <img [src]="team.flagUrl" [alt]="team.teamName" style="width: 100%; height: 100%; object-fit: cover;">
              <span style="position: absolute; bottom: 8px; right: 8px; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; background-color: rgba(0,0,0,0.75); color: white;">
                {{ team.countryCode }}
              </span>
              <!-- Selection indicator -->
              <span *ngIf="isCurrentVote(team.id)" style="position: absolute; top: 8px; left: 8px; background-color: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%;">
                <mat-icon style="font-size: 20px; width: 20px; height: 20px;">check</mat-icon>
              </span>
            </div>

            <!-- Detail Area -->
            <div style="padding: 16px;">
              <h3 style="font-family: 'Outfit'; font-size: 1.25rem; font-weight: bold; margin: 0;">{{ team.teamName }}</h3>
            </div>
          </div>

          <!-- Actions -->
          <mat-card-actions style="padding: 0 16px 16px 16px; display: flex; gap: 8px; justify-content: stretch;">
            <ng-container *ngIf="settings()?.isVotingEnabled && !settings()?.isResultPublished; else disabledState">
              
              <button *ngIf="isCurrentVote(team.id)" mat-flat-button color="accent" class="bg-gold" style="width: 100%; pointer-events: none;">
                <mat-icon>check_circle</mat-icon> Voted Selection
              </button>

              <button *ngIf="!isCurrentVote(team.id) && !hasVoted()" mat-raised-button color="primary" style="width: 100%;" (click)="onVote(team)">
                Cast Vote
              </button>

              <button *ngIf="!isCurrentVote(team.id) && hasVoted()" mat-outlined-button color="primary" style="width: 100%;" (click)="onVote(team)">
                Change Vote to This
              </button>

            </ng-container>
            <ng-template #disabledState>
              <button mat-flat-button disabled style="width: 100%;">
                Voting Locked
              </button>
            </ng-template>
          </mat-card-actions>
        </mat-card>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class TeamsComponent implements OnInit {
  private teamService = inject(TeamService);
  private voteService = inject(VoteService);
  private settingService = inject(SettingService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  teams = signal<Team[]>([]);
  activeVote = signal<Vote | null>(null);
  settings = signal<Setting | null>(null);
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(true);

  // Computeds
  hasVoted = computed(() => this.activeVote() !== null);
  isCurrentVote = (teamId: number) => this.activeVote()?.teamId === teamId;

  filteredTeams = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.teams();
    return this.teams().filter(
      (t) =>
        t.teamName.toLowerCase().includes(query) ||
        t.countryCode.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    
    // Load Settings
    this.settingService.getSettings().subscribe({
      next: (settingRes) => {
        if (settingRes.success && settingRes.data) {
          this.settings.set(settingRes.data);
        }

        // Load Active Vote
        this.voteService.getMyVote().subscribe({
          next: (voteRes) => {
            if (voteRes.success && voteRes.data) {
              this.activeVote.set(voteRes.data);
            } else {
              this.activeVote.set(null);
            }

            // Load All Teams
            this.teamService.getAllTeams().subscribe({
              next: (teamRes) => {
                this.isLoading.set(false);
                if (teamRes.success && teamRes.data) {
                  this.teams.set(teamRes.data);
                }
              },
              error: () => this.isLoading.set(false)
            });
          },
          error: () => this.isLoading.set(false)
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Error initializing voting system configurations.', 'Close', { duration: 4000 });
      }
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  onVote(team: Team): void {
    const isVoteChange = this.hasVoted();
    const confirmTitle = isVoteChange ? 'Change Vote Selection' : 'Confirm Vote Casting';
    const confirmMessage = isVoteChange 
      ? `Are you sure you want to change your vote from ${this.activeVote()?.teamName} to ${team.teamName}?`
      : `Are you sure you want to cast your vote for ${team.teamName}? Each user is allowed only 1 active vote.`;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: confirmTitle,
        message: confirmMessage,
        confirmText: 'Vote',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.isLoading.set(true);
        this.voteService.castVote(team.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.snackBar.open(res.message, 'Close', { duration: 3000 });
              this.activeVote.set(res.data);
            } else {
              this.snackBar.open(res.message, 'Close', { duration: 4000 });
            }
            this.isLoading.set(false);
          },
          error: (err) => {
            this.isLoading.set(false);
            this.snackBar.open(err.message || 'Failed to register vote.', 'Close', { duration: 4000 });
          }
        });
      }
    });
  }
}
