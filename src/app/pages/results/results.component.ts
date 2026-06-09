import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { VoteService } from '../../core/services/vote.service';
import { SettingService } from '../../core/services/setting.service';
import { VoteResult, Vote, Setting } from '../../core/models/api.models';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div style="padding: 24px; max-width: 800px; margin: 0 auto; width: 100%;">
      <!-- Header -->
      <div style="margin-bottom: 32px; text-align: center;">
        <h2 style="font-family: 'Outfit'; font-size: 2.2rem; font-weight: 800; margin: 0;">Poll Standings</h2>
        <p style="opacity: 0.7; margin: 4px 0 0 0;">Observe vote rankings and statistics across all teams.</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" style="display: flex; align-items: center; justify-content: center; min-height: 200px;">
        <mat-spinner [diameter]="48"></mat-spinner>
      </div>

      <div *ngIf="!isLoading()">
        
        <!-- Results Hidden State -->
        <div *ngIf="!isResultsVisible(); else visibleState" 
             style="text-align: center; padding: 48px 24px; border: 1px solid rgba(128,128,128,0.15); border-radius: 16px;">
          <mat-icon style="font-size: 64px; width: 64px; height: 64px; color: #f59e0b; margin-bottom: 16px;">visibility_off</mat-icon>
          <h3 style="font-family: 'Outfit'; font-size: 1.6rem; font-weight: bold; margin: 0 0 8px 0;">Standings Are Locked</h3>
          <p style="opacity: 0.7; max-width: 400px; margin: 0 auto 24px auto; line-height: 1.5;">
            The poll results remain hidden by default during active voting. Once the administrator publishes the final results, you can view the complete ranks here.
          </p>
          <div style="display: inline-block; padding: 8px 16px; border-radius: 20px; background-color: rgba(245,158,11,0.1); color: #b45309; font-size: 0.85rem; font-weight: 600;">
            Awaiting Admin Publication
          </div>
        </div>

        <!-- Standings Table/View -->
        <ng-template #visibleState>
          
          <!-- Live Preview Banner for Admin -->
          <div *ngIf="!settings()?.isResultPublished && authService.isAdmin()" 
               style="margin-bottom: 24px; padding: 12px 16px; border-radius: 8px; font-size: 0.85rem; background-color: rgba(59,130,246,0.1); color: #1d4ed8; display: flex; align-items: center; gap: 8px; font-weight: 500;">
            <mat-icon>visibility</mat-icon>
            <span>Live Standings Preview: Only you (Admin) can view these standings since results are not yet published.</span>
          </div>

          <!-- Total Votes Tally -->
          <div style="background-color: var(--primary-color); color: white; padding: 24px; border-radius: 12px; margin-bottom: 28px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <span style="font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.8; font-weight: bold;">Aggregate Poll Volume</span>
            <h3 style="font-family: 'Outfit'; font-size: 3rem; font-weight: 800; margin: 4px 0 0 0; line-height: 1;">{{ sumVotes() }}</h3>
            <p style="margin: 4px 0 0 0; font-size: 0.85rem; opacity: 0.7;">Active votes submitted by registered fans</p>
          </div>

          <!-- Leaderboard Grid -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <mat-card *ngFor="let result of results(); let i = index" 
                      style="padding: 16px 20px; border-radius: 12px; border: 1px solid rgba(128,128,128,0.1); display: flex; flex-direction: column; gap: 8px;"
                      [style.background-color]="isLeader(i) ? 'rgba(251,191,36,0.05)' : ''"
                      [style.border-color]="isLeader(i) ? '#fbbf24' : 'rgba(128,128,128,0.1)'">
              
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                <!-- Team Metadata -->
                <div style="display: flex; align-items: center; gap: 16px;">
                  <span style="font-family: 'Outfit'; font-size: 1.3rem; font-weight: 800; min-width: 28px; opacity: 0.8;">
                    #{{ i + 1 }}
                  </span>
                  <img [src]="result.flagUrl" [alt]="result.teamName" style="width: 44px; height: 30px; object-fit: cover; border-radius: 4px; border: 1px solid rgba(128,128,128,0.2);">
                  <div>
                    <span style="font-weight: 700; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                      {{ result.teamName }}
                      <span *ngIf="isLeader(i)" class="gold-accent" title="Current Leader" style="display: flex; align-items: center;">
                        <mat-icon style="font-size: 18px; width: 18px; height: 18px;">stars</mat-icon>
                      </span>
                      <!-- Own Vote Tag -->
                      <span *ngIf="isUserVote(result.teamId)" style="background-color: var(--primary-color); color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; font-weight: bold;">
                        Your Vote
                      </span>
                    </span>
                    <span style="font-size: 0.8rem; opacity: 0.6;">Code: {{ result.countryCode }}</span>
                  </div>
                </div>

                <!-- Counts & Percent -->
                <div style="text-align: right;">
                  <span style="font-weight: 800; font-size: 1.15rem; font-family: 'Outfit';">{{ result.voteCount }} {{ result.voteCount === 1 ? 'vote' : 'votes' }}</span>
                  <div style="font-size: 0.85rem; opacity: 0.7; font-weight: 500;">{{ result.percentage }}%</div>
                </div>
              </div>

              <!-- Progress bar representation -->
              <mat-progress-bar mode="determinate" [value]="result.percentage" color="primary" style="height: 6px; border-radius: 3px;"></mat-progress-bar>
            </mat-card>
          </div>

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
export class ResultsComponent implements OnInit {
  authService = inject(AuthService);
  private voteService = inject(VoteService);
  private settingService = inject(SettingService);
  private snackBar = inject(MatSnackBar);

  results = signal<VoteResult[]>([]);
  activeVote = signal<Vote | null>(null);
  settings = signal<Setting | null>(null);
  isLoading = signal<boolean>(true);

  // Computeds
  sumVotes = computed(() => this.results().reduce((sum, r) => sum + r.voteCount, 0));
  isResultsVisible = computed(() => this.settings()?.isResultPublished || this.authService.isAdmin());
  isLeader = (index: number) => index === 0 && this.results()[index].voteCount > 0;
  isUserVote = (teamId: number) => this.activeVote()?.teamId === teamId;

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

        // Load results
        const isAdmin = this.authService.isAdmin();
        const resultsVisible = this.settings()?.isResultPublished || isAdmin;

        if (resultsVisible) {
          this.voteService.getResults().subscribe({
            next: (res) => {
              if (res.success && res.data) {
                this.results.set(res.data);
              }
              this.loadMyVote();
            },
            error: () => this.isLoading.set(false)
          });
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Error loading standings data.', 'Close', { duration: 4000 });
      }
    });
  }

  loadMyVote(): void {
    this.voteService.getMyVote().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.activeVote.set(res.data);
        }
      },
      error: () => this.isLoading.set(false)
    });
  }
}
