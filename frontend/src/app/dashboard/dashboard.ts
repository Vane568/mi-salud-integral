import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { MEAL_LABELS, MealType } from '../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly auth = inject(AuthService);

  readonly user = this.auth.currentUser;
  readonly mealTypes = Object.keys(MEAL_LABELS) as MealType[];
  readonly mealLabels = MEAL_LABELS;

  readonly recentLogs = computed(() => {
    const user = this.user();
    return user ? this.auth.getRecentLogs(user.id) : [];
  });

  formatDate(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  formatFoods(logId: string, mealType: MealType): string {
    const log = this.recentLogs().find((l) => l.id === logId);
    if (!log) {
      return '—';
    }
    const foods = this.auth.foodsForMeal(log, mealType);
    if (!foods.length) {
      return '—';
    }
    return foods.map((f) => `${f.foodName}: ${f.quantity} ${f.unit}`).join(' · ');
  }
}
