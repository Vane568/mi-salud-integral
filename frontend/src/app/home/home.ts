import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    if (this.auth.isAuthenticated()) {
      void this.router.navigateByUrl('/inicio');
    }
  }
}
