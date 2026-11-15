import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import {
  FOOD_UNITS,
  FoodUnit,
  MEAL_LABELS,
  MOOD_OPTIONS,
  MealType,
} from '../core/models';

interface FoodDraft {
  foodName: string;
  quantity: number | null;
  unit: FoodUnit;
}

@Component({
  selector: 'app-daily-log',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './daily-log.html',
  styleUrl: './daily-log.css',
})
export class DailyLogPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly mealTypes = Object.keys(MEAL_LABELS) as MealType[];
  readonly mealLabels = MEAL_LABELS;
  readonly units = FOOD_UNITS;
  readonly moods = MOOD_OPTIONS;

  logDate = new Date().toISOString().slice(0, 10);
  waterLiters: number | null = null;
  sleepHours: number | null = null;
  activity = '';
  mood = '';
  symptoms = '';
  foods: Record<MealType, FoodDraft[]> = {
    breakfast: [],
    lunch: [],
    snack: [],
    dinner: [],
    snacks: [],
  };

  readonly error = signal('');

  addFood(meal: MealType): void {
    this.foods[meal] = [
      ...this.foods[meal],
      { foodName: '', quantity: null, unit: 'g' },
    ];
  }

  removeFood(meal: MealType, index: number): void {
    this.foods[meal] = this.foods[meal].filter((_, i) => i !== index);
  }

  save(): void {
    const user = this.auth.currentUser();
    if (!user) {
      return;
    }

    try {
      if (!this.logDate || Number.isNaN(Date.parse(this.logDate))) {
        throw new Error('fecha');
      }
      if (this.waterLiters != null && !(this.waterLiters >= 0 && this.waterLiters <= 20)) {
        throw new Error('agua');
      }
      if (this.sleepHours != null && !(this.sleepHours >= 0 && this.sleepHours <= 24)) {
        throw new Error('sueño');
      }

      const foods = this.mealTypes.flatMap((meal) =>
        this.foods[meal].map((item) => {
          const foodName = item.foodName.trim();
          const quantity = Number(item.quantity);
          if (!foodName || foodName.length > 150) {
            throw new Error('alimento');
          }
          if (!(quantity > 0 && quantity <= 100000)) {
            throw new Error('cantidad');
          }
          if (!this.units.some((u) => u.value === item.unit)) {
            throw new Error('unidad');
          }
          return {
            mealType: meal,
            foodName,
            quantity,
            unit: item.unit,
          };
        }),
      );

      this.auth.addDailyLog({
        userId: user.id,
        logDate: this.logDate,
        waterLiters: this.waterLiters,
        activity: this.activity.trim(),
        sleepHours: this.sleepHours,
        mood: this.mood.trim(),
        symptoms: this.symptoms.trim(),
        foods,
      });

      void this.router.navigateByUrl('/inicio');
    } catch {
      this.error.set(
        'Revisá la fecha, las cantidades, las unidades, el agua y el sueño.',
      );
    }
  }
}
