import { Component } from '@angular/core';
import { AuthService } from '../../components/core/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  isLoggedIn = false;
  username: string | null = null;
  // Utilisez le décorateur @Component pour définir le composant Angular
  

  constructor(private authService: AuthService, private router: Router) {
    // Abonnez-vous à isLoggedIn$ pour détecter les changements d'état de connexion
    this.authService.isLoggedIn$.subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
      if (loggedIn) {
        this.username = this.authService.getUsername(); // Récupère le nom de l'utilisateur connecté
      } else {
        this.username = null; // Réinitialise le nom si l'utilisateur est déconnecté
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/signin']);
  }
}
