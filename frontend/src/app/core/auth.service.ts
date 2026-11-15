import { Injectable, computed, signal } from '@angular/core';
import {
  DailyLog,
  FoodItem,
  HealthProfile,
  MealType,
  UserAccount,
} from './models';

const USERS_KEY = 'msi.users';
const SESSION_KEY = 'msi.sessionUserId';
const PROFILES_KEY = 'msi.profiles';
const LOGS_KEY = 'msi.dailyLogs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessionUserId = signal<string | null>(this.readSession());
  readonly currentUser = computed(() => {
    const id = this.sessionUserId();
    return id ? this.getUsers().find((u) => u.id === id) ?? null : null;
  });
  readonly isAuthenticated = computed(() => !!this.currentUser());

  async register(name: string, email: string, password: string): Promise<string | null> {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanName || !cleanEmail || password.length < 10) {
      return 'Completá todos los campos. La contraseña debe tener al menos 10 caracteres.';
    }
    const users = this.getUsers();
    if (users.some((u) => u.email === cleanEmail)) {
      return 'Ese correo ya tiene una cuenta. Iniciá sesión.';
    }

    const user: UserAccount = {
      id: crypto.randomUUID(),
      name: cleanName,
      email: cleanEmail,
      passwordHash: await this.hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    this.saveUsers(users);
    this.saveProfile({
      userId: user.id,
      birthDate: null,
      healthGoals: '',
      diagnosedConditions: '',
      symptoms: '',
      medications: '',
      allergies: '',
      updatedAt: new Date().toISOString(),
    });
    this.sessionUserId.set(user.id);
    localStorage.setItem(SESSION_KEY, user.id);
    return null;
  }

  async login(email: string, password: string): Promise<string | null> {
    const cleanEmail = email.trim().toLowerCase();
    const user = this.getUsers().find((u) => u.email === cleanEmail);
    if (!user || !(await this.checkPassword(password, user.passwordHash))) {
      return 'Correo o contraseña incorrectos.';
    }
    this.sessionUserId.set(user.id);
    localStorage.setItem(SESSION_KEY, user.id);
    return null;
  }

  logout(): void {
    this.sessionUserId.set(null);
    localStorage.removeItem(SESSION_KEY);
  }

  getProfile(userId: string): HealthProfile {
    const profiles = this.getProfiles();
    const existing = profiles.find((p) => p.userId === userId);
    if (existing) {
      return existing;
    }
    const created: HealthProfile = {
      userId,
      birthDate: null,
      healthGoals: '',
      diagnosedConditions: '',
      symptoms: '',
      medications: '',
      allergies: '',
      updatedAt: new Date().toISOString(),
    };
    this.saveProfile(created);
    return created;
  }

  saveProfile(profile: HealthProfile): void {
    const profiles = this.getProfiles().filter((p) => p.userId !== profile.userId);
    profiles.push({ ...profile, updatedAt: new Date().toISOString() });
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  }

  getRecentLogs(userId: string, limit = 7): DailyLog[] {
    return this.getLogs()
      .filter((l) => l.userId === userId)
      .sort((a, b) => {
        if (a.logDate === b.logDate) {
          return b.createdAt.localeCompare(a.createdAt);
        }
        return b.logDate.localeCompare(a.logDate);
      })
      .slice(0, limit);
  }

  addDailyLog(input: {
    userId: string;
    logDate: string;
    waterLiters: number | null;
    activity: string;
    sleepHours: number | null;
    mood: string;
    symptoms: string;
    foods: Omit<FoodItem, 'id'>[];
  }): void {
    const entry: DailyLog = {
      id: crypto.randomUUID(),
      userId: input.userId,
      logDate: input.logDate,
      waterLiters: input.waterLiters,
      activity: input.activity,
      sleepHours: input.sleepHours,
      mood: input.mood,
      symptoms: input.symptoms,
      foods: input.foods.map((f) => ({ ...f, id: crypto.randomUUID() })),
      createdAt: new Date().toISOString(),
    };
    const logs = this.getLogs();
    logs.push(entry);
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  }

  foodsForMeal(log: DailyLog, mealType: MealType): FoodItem[] {
    return log.foods.filter((f) => f.mealType === mealType);
  }

  private readSession(): string | null {
    return localStorage.getItem(SESSION_KEY);
  }

  private getUsers(): UserAccount[] {
    return this.readJson<UserAccount[]>(USERS_KEY, []);
  }

  private saveUsers(users: UserAccount[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  private getProfiles(): HealthProfile[] {
    return this.readJson<HealthProfile[]>(PROFILES_KEY, []);
  }

  private getLogs(): DailyLog[] {
    return this.readJson<DailyLog[]>(LOGS_KEY, []);
  }

  private readJson<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const data = new TextEncoder().encode(`msi:${password}`);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private async checkPassword(password: string, hash: string): Promise<boolean> {
    return (await this.hashPassword(password)) === hash;
  }
}
