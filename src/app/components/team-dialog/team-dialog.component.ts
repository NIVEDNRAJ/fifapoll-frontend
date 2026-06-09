import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Team } from '../../core/models/api.models';

@Component({
  selector: 'app-team-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit Team' : 'Add Team' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="teamForm" style="display: flex; flex-direction: column; gap: 16px; min-width: 320px; padding: 8px 0;">
        <mat-form-field appearance="outline">
          <mat-label>Team Name</mat-label>
          <input matInput formControlName="teamName" placeholder="e.g. Argentina">
          <mat-error *ngIf="teamForm.get('teamName')?.hasError('required')">Team Name is required</mat-error>
          <mat-error *ngIf="teamForm.get('teamName')?.hasError('minlength')">Must be at least 3 characters</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Country Code (3 letters)</mat-label>
          <input matInput formControlName="countryCode" placeholder="e.g. ARG" maxlength="3">
          <mat-error *ngIf="teamForm.get('countryCode')?.hasError('required')">Country Code is required</mat-error>
          <mat-error *ngIf="teamForm.get('countryCode')?.hasError('minlength') || teamForm.get('countryCode')?.hasError('maxlength')">Must be exactly 3 characters</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Flag URL</mat-label>
          <input matInput formControlName="flagUrl" placeholder="e.g. https://flagcdn.com/w320/ar.png">
          <mat-error *ngIf="teamForm.get('flagUrl')?.hasError('required')">Flag URL is required</mat-error>
          <mat-error *ngIf="teamForm.get('flagUrl')?.hasError('pattern')">Must be a valid HTTP/HTTPS URL</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" style="gap: 8px;">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="teamForm.invalid" (click)="onSave()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      padding: 8px;
    }
  `]
})
export class TeamDialogComponent {
  private fb = inject(FormBuilder);
  teamForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<TeamDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Team | null
  ) {
    this.teamForm = this.fb.group({
      teamName: [this.data?.teamName || '', [Validators.required, Validators.minLength(3)]],
      countryCode: [this.data?.countryCode || '', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      flagUrl: [this.data?.flagUrl || '', [Validators.required, Validators.pattern(/^https?:\/\/.+$/)]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.teamForm.valid) {
      const formValue = this.teamForm.value;
      formValue.countryCode = formValue.countryCode.toUpperCase();
      this.dialogRef.close(formValue);
    }
  }
}
