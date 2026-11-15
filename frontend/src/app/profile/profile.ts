import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  birthDate = '';
  healthGoals = '';
  diagnosedConditions = '';
  symptoms = '';
  medications = '';
  allergies = '';
  readonly notice = signal('');

  constructor() {
    const user = this.auth.currentUser();
    if (!user) {
      return;
    }
    const profile = this.auth.getProfile(user.id);
    this.birthDate = profile.birthDate ?? '';
    this.healthGoals = profile.healthGoals;
    this.diagnosedConditions = profile.diagnosedConditions;
    this.symptoms = profile.symptoms;
    this.medications = profile.medications;
    this.allergies = profile.allergies;
  }

  save(): void {
    const user = this.auth.currentUser();
    if (!user) {
      return;
    }
    if (this.birthDate) {
      const parsed = Date.parse(this.birthDate);
      if (Number.isNaN(parsed)) {
        this.notice.set('La fecha ingresada no es válida.');
        return;
      }
    }
    this.auth.saveProfile({
      userId: user.id,
      birthDate: this.birthDate || null,
      healthGoals: this.healthGoals.trim(),
      diagnosedConditions: this.diagnosedConditions.trim(),
      symptoms: this.symptoms.trim(),
      medications: this.medications.trim(),
      allergies: this.allergies.trim(),
      updatedAt: new Date().toISOString(),
    });
    void this.router.navigateByUrl('/inicio');
  }
}
