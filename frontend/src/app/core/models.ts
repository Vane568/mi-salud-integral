export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'snacks';

export type FoodUnit =
  | 'g'
  | 'ml'
  | 'unidad'
  | 'cucharada'
  | 'cucharadita'
  | 'taza';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface HealthProfile {
  userId: string;
  birthDate: string | null;
  healthGoals: string;
  diagnosedConditions: string;
  symptoms: string;
  medications: string;
  allergies: string;
  updatedAt: string;
}

export interface FoodItem {
  id: string;
  mealType: MealType;
  foodName: string;
  quantity: number;
  unit: FoodUnit;
}

export interface DailyLog {
  id: string;
  userId: string;
  logDate: string;
  waterLiters: number | null;
  activity: string;
  sleepHours: number | null;
  mood: string;
  symptoms: string;
  foods: FoodItem[];
  createdAt: string;
}

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  snack: 'Merienda',
  dinner: 'Cena',
  snacks: 'Colaciones',
};

export const FOOD_UNITS: { value: FoodUnit; label: string }[] = [
  { value: 'g', label: 'Gramos (g)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'unidad', label: 'Unidad' },
  { value: 'cucharada', label: 'Cucharada' },
  { value: 'cucharadita', label: 'Cucharadita' },
  { value: 'taza', label: 'Taza' },
];

export const MOOD_OPTIONS = ['Muy bien', 'Bien', 'Regular', 'Mal', 'Muy mal'] as const;
