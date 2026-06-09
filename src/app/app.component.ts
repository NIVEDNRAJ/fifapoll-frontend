import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatSnackBarModule,
    MatMenuModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);

  isDarkTheme = signal<boolean>(false);
  isMobileNavOpen = signal<boolean>(false);

  constructor() {
    // Sync theme signal to body element class
    effect(() => {
      const dark = this.isDarkTheme();
      if (dark) {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        localStorage.setItem('fifa_theme', 'dark');
      } else {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        localStorage.setItem('fifa_theme', 'light');
      }
    });
  }

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('fifa_theme');
    if (savedTheme === 'dark') {
      this.isDarkTheme.set(true);
    } else {
      this.isDarkTheme.set(false);
    }
  }

  toggleTheme(): void {
    this.isDarkTheme.update(dark => !dark);
  }

  logout(): void {
    this.authService.logout();
    this.isMobileNavOpen.set(false);
  }

  toggleMobileNav(): void {
    this.isMobileNavOpen.update(open => !open);
  }
}
