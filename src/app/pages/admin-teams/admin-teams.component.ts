import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TeamService } from '../../core/services/team.service';
import { Team, CreateTeam } from '../../core/models/api.models';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { TeamDialogComponent } from '../../components/team-dialog/team-dialog.component';

@Component({
  selector: 'app-admin-teams',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div style="padding: 24px; max-width: 1000px; margin: 0 auto; width: 100%;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 32px;">
        <div>
          <h2 style="font-family: 'Outfit'; font-size: 2.2rem; font-weight: 800; margin: 0;">Manage Teams</h2>
          <p style="opacity: 0.7; margin: 4px 0 0 0;">Create, modify, or remove competing nations from the polling system database.</p>
        </div>

        <button mat-raised-button color="primary" (click)="onAddTeam()">
          <mat-icon>add</mat-icon> Add New Team
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" style="display: flex; align-items: center; justify-content: center; min-height: 200px;">
        <mat-spinner [diameter]="48"></mat-spinner>
      </div>

      <!-- Table View -->
      <div *ngIf="!isLoading()">
        <mat-card style="border-radius: 12px; overflow: hidden; border: 1px solid rgba(128,128,128,0.15); padding: 0;">
          <table mat-table [dataSource]="teams()" style="width: 100%;">
            
            <!-- Flag Column -->
            <ng-container matColumnDef="flag">
              <th mat-header-cell *matHeaderCellDef style="font-family: 'Outfit'; font-weight: bold; font-size: 0.95rem;"> Flag </th>
              <td mat-cell *matCellDef="let element"> 
                <img [src]="element.flagUrl" [alt]="element.teamName" style="width: 50px; height: 34px; object-fit: cover; border-radius: 4px; border: 1px solid rgba(128,128,128,0.1); margin: 8px 0; display: block;"> 
              </td>
            </ng-container>

            <!-- Name Column -->
            <ng-container matColumnDef="teamName">
              <th mat-header-cell *matHeaderCellDef style="font-family: 'Outfit'; font-weight: bold; font-size: 0.95rem;"> Country </th>
              <td mat-cell *matCellDef="let element" style="font-weight: 600;"> {{element.teamName}} </td>
            </ng-container>

            <!-- Code Column -->
            <ng-container matColumnDef="countryCode">
              <th mat-header-cell *matHeaderCellDef style="font-family: 'Outfit'; font-weight: bold; font-size: 0.95rem;"> Code </th>
              <td mat-cell *matCellDef="let element" style="font-family: monospace; font-size: 0.95rem;"> {{element.countryCode}} </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef style="font-family: 'Outfit'; font-weight: bold; font-size: 0.95rem; text-align: right; padding-right: 24px;"> Actions </th>
              <td mat-cell *matCellDef="let element" style="text-align: right; padding-right: 24px;">
                <button mat-icon-button color="primary" (click)="onEditTeam(element)" title="Edit Team" style="margin-right: 8px;">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="onDeleteTeam(element)" title="Delete Team">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <!-- Empty State -->
          <div *ngIf="teams().length === 0" style="text-align: center; padding: 48px; opacity: 0.7;">
            <mat-icon style="font-size: 48px; width: 48px; height: 48px; margin-bottom: 8px; color: #9ca3af;">flag</mat-icon>
            <p style="margin: 0; font-weight: 500;">No teams available in the system. Click 'Add New Team' to seed one.</p>
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
export class AdminTeamsComponent implements OnInit {
  private teamService = inject(TeamService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  teams = signal<Team[]>([]);
  isLoading = signal<boolean>(true);
  displayedColumns: string[] = ['flag', 'teamName', 'countryCode', 'actions'];

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.isLoading.set(true);
    this.teamService.getAllTeams().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.teams.set(res.data);
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  onAddTeam(): void {
    const dialogRef = this.dialog.open(TeamDialogComponent, {
      width: '450px',
      data: null
    });

    dialogRef.afterClosed().subscribe((result: CreateTeam | undefined) => {
      if (result) {
        this.isLoading.set(true);
        this.teamService.createTeam(result).subscribe({
          next: (res) => {
            this.isLoading.set(false);
            if (res.success) {
              this.snackBar.open(res.message, 'Close', { duration: 3000 });
              this.loadTeams();
            } else {
              this.snackBar.open(res.message, 'Close', { duration: 4000 });
            }
          },
          error: (err) => {
            this.isLoading.set(false);
            this.snackBar.open(err.message || 'Error creating team.', 'Close', { duration: 4000 });
          }
        });
      }
    });
  }

  onEditTeam(team: Team): void {
    const dialogRef = this.dialog.open(TeamDialogComponent, {
      width: '450px',
      data: team
    });

    dialogRef.afterClosed().subscribe((result: CreateTeam | undefined) => {
      if (result) {
        this.isLoading.set(true);
        this.teamService.updateTeam(team.id, result).subscribe({
          next: (res) => {
            this.isLoading.set(false);
            if (res.success) {
              this.snackBar.open(res.message, 'Close', { duration: 3000 });
              this.loadTeams();
            } else {
              this.snackBar.open(res.message, 'Close', { duration: 4000 });
            }
          },
          error: (err) => {
            this.isLoading.set(false);
            this.snackBar.open(err.message || 'Error updating team.', 'Close', { duration: 4000 });
          }
        });
      }
    });
  }

  onDeleteTeam(team: Team): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Team',
        message: `Are you sure you want to delete ${team.teamName}? Deleting this team will remove all associated votes from the system standings.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.isLoading.set(true);
        this.teamService.deleteTeam(team.id).subscribe({
          next: (res) => {
            this.isLoading.set(false);
            if (res.success) {
              this.snackBar.open(res.message, 'Close', { duration: 3000 });
              this.loadTeams();
            } else {
              this.snackBar.open(res.message, 'Close', { duration: 4000 });
            }
          },
          error: (err) => {
            this.isLoading.set(false);
            this.snackBar.open(err.message || 'Error deleting team.', 'Close', { duration: 4000 });
          }
        });
      }
    });
  }
}
