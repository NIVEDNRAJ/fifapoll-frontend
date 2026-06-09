import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { VoteService } from '../../core/services/vote.service';
import { VoterDetails } from '../../core/models/api.models';

@Component({
  selector: 'app-admin-votes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div style="padding: 24px; max-width: 1100px; margin: 0 auto; width: 100%;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 32px;">
        <div>
          <h2 style="font-family: 'Outfit'; font-size: 2.2rem; font-weight: 800; margin: 0;">Voters & Audit</h2>
          <p style="opacity: 0.7; margin: 4px 0 0 0;">Inspect registered users, check their voting statuses, and audit vote history.</p>
        </div>

        <!-- Search -->
        <mat-form-field appearance="outline" style="min-width: 280px; width: 100%; max-width: 360px;">
          <mat-label>Search voter or team...</mat-label>
          <input matInput (input)="onSearch($event)" placeholder="e.g. John, user@mail.com, Brazil">
          <mat-icon matPrefix style="margin-right: 8px; opacity: 0.6;">search</mat-icon>
        </mat-form-field>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" style="display: flex; align-items: center; justify-content: center; min-height: 200px;">
        <mat-spinner [diameter]="48"></mat-spinner>
      </div>

      <!-- Voters Table -->
      <div *ngIf="!isLoading()">
        <mat-card style="border-radius: 12px; overflow: hidden; border: 1px solid rgba(128,128,128,0.15); padding: 0;">
          <table mat-table [dataSource]="filteredVoters()" style="width: 100%;">
            
            <!-- User ID Column -->
            <ng-container matColumnDef="userId">
              <th mat-header-cell *matHeaderCellDef style="font-family: 'Outfit'; font-weight: bold; font-size: 0.95rem; width: 80px;"> ID </th>
              <td mat-cell *matCellDef="let element" style="opacity: 0.7; font-family: monospace;"> #{{element.userId}} </td>
            </ng-container>

            <!-- Name Column -->
            <ng-container matColumnDef="userName">
              <th mat-header-cell *matHeaderCellDef style="font-family: 'Outfit'; font-weight: bold; font-size: 0.95rem;"> Voter Name </th>
              <td mat-cell *matCellDef="let element" style="font-weight: 600;"> {{element.userName}} </td>
            </ng-container>

            <!-- Email Column -->
            <ng-container matColumnDef="userEmail">
              <th mat-header-cell *matHeaderCellDef style="font-family: 'Outfit'; font-weight: bold; font-size: 0.95rem;"> Email </th>
              <td mat-cell *matCellDef="let element"> {{element.userEmail}} </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="hasVoted">
              <th mat-header-cell *matHeaderCellDef style="font-family: 'Outfit'; font-weight: bold; font-size: 0.95rem;"> Status </th>
              <td mat-cell *matCellDef="let element">
                <span style="display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold;"
                      [style.background-color]="element.hasVoted ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)'"
                      [style.color]="element.hasVoted ? '#047857' : '#4b5563'">
                  {{element.hasVoted ? 'Voted' : 'Not Voted'}}
                </span>
              </td>
            </ng-container>

            <!-- Choice Column -->
            <ng-container matColumnDef="votedTeamName">
              <th mat-header-cell *matHeaderCellDef style="font-family: 'Outfit'; font-weight: bold; font-size: 0.95rem;"> Voted Team </th>
              <td mat-cell *matCellDef="let element" style="font-weight: 600;">
                <span *ngIf="element.hasVoted; else emptyCell">
                  {{element.votedTeamName}}
                </span>
                <ng-template #emptyCell>
                  <span style="opacity: 0.4; font-weight: normal;">&mdash;</span>
                </ng-template>
              </td>
            </ng-container>

            <!-- Date Column -->
            <ng-container matColumnDef="votedAt">
              <th mat-header-cell *matHeaderCellDef style="font-family: 'Outfit'; font-weight: bold; font-size: 0.95rem; text-align: right; padding-right: 24px;"> Date Voted </th>
              <td mat-cell *matCellDef="let element" style="text-align: right; padding-right: 24px; opacity: 0.7; font-size: 0.85rem;">
                <span *ngIf="element.hasVoted; else emptyCellDate">
                  {{element.votedAt | date:'medium'}}
                </span>
                <ng-template #emptyCellDate>
                  <span style="opacity: 0.4;">&mdash;</span>
                </ng-template>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <!-- Empty State -->
          <div *ngIf="filteredVoters().length === 0" style="text-align: center; padding: 48px; opacity: 0.7;">
            <mat-icon style="font-size: 48px; width: 48px; height: 48px; margin-bottom: 8px; color: #9ca3af;">people_outline</mat-icon>
            <p style="margin: 0; font-weight: 500;">No voters matched your search query.</p>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    table {
      background-color: transparent !important;
    }
  `]
})
export class AdminVotesComponent implements OnInit {
  private voteService = inject(VoteService);
  private snackBar = inject(MatSnackBar);

  voters = signal<VoterDetails[]>([]);
  isLoading = signal<boolean>(true);
  searchQuery = signal<string>('');
  displayedColumns: string[] = ['userId', 'userName', 'userEmail', 'hasVoted', 'votedTeamName', 'votedAt'];

  filteredVoters = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.voters();
    return this.voters().filter(
      (v) =>
        v.userName.toLowerCase().includes(query) ||
        v.userEmail.toLowerCase().includes(query) ||
        v.votedTeamName.toLowerCase().includes(query) ||
        (v.hasVoted && 'voted'.includes(query)) ||
        (!v.hasVoted && 'not voted'.includes(query))
    );
  });

  ngOnInit(): void {
    this.loadVoterDetails();
  }

  loadVoterDetails(): void {
    this.isLoading.set(true);
    this.voteService.getVoterDetails().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.voters.set(res.data);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Error fetching voter audit logs.', 'Close', { duration: 4000 });
      }
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }
}
