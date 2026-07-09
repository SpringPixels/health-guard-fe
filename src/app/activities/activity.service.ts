import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

export interface ActivityLogResponse {
  date: string;
  completed: boolean;
  activity_type: string | null;
}

export interface StreakResponse {
  current_streak: number;
  longest_streak: number;
  last_7_days: ActivityLogResponse[];
  message: string;
}

export interface SegmentResponse {
  cluster_id: number;
  segment_label: string;
  recommended_activity: string;
  goal: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private http = inject(HttpClient);

  private _recommendedActivity = signal<string>('30-min Walk'); // Fallback
  public recommendedActivity = this._recommendedActivity.asReadonly();

  private _streakData = signal<StreakResponse | null>(null);
  public streakData = this._streakData.asReadonly();

  public currentStreak = computed(() => this._streakData()?.current_streak || 0);
  public last7Days = computed(() => this._streakData()?.last_7_days || []);
  public streakMessage = computed(() => this._streakData()?.message || 'Keep it up!');

  public hasCheckedInToday = computed(() => {
    const list = this.last7Days();
    if (!list || list.length === 0) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = list.find(l => l.date === todayStr);
    return todayLog ? todayLog.completed : false;
  });

  public loadStreak() {
    this.http.get<StreakResponse>(`${environment.apiUrl}/activity/streak`).subscribe({
      next: (res) => this._streakData.set(res),
      error: (err) => console.error('Error fetching streak', err)
    });
  }

  public loadRecommendation() {
    // 1. Fetch latest prediction for this user
    this.http.get<any[]>(`${environment.apiUrl}/predictions/me`).pipe(
      switchMap((predictions) => {
        if (predictions && predictions.length > 0) {
          const p = predictions[0];
          // Use the prediction payload to get the segment
          const payload = {
            age_group: p.age_group,
            bmi: p.bmi,
            income_lpa: p.income_lpa,
            city_tier: p.city_tier,
            lifestyle_risk: p.lifestyle_risk,
            occupation: p.occupation // Optional
          };
          return this.http.post<SegmentResponse>(`${environment.apiUrl}/segment/predict`, payload);
        } else {
          // If no predictions, just use a default or empty payload (may fail depending on backend)
          return of(null);
        }
      })
    ).subscribe({
      next: (segmentRes) => {
        if (segmentRes && segmentRes.recommended_activity) {
          this._recommendedActivity.set(segmentRes.recommended_activity);
        }
      },
      error: (err) => console.error('Error fetching recommendation', err)
    });
  }

  public checkIn(activityType: string) {
    if (this.hasCheckedInToday()) {
      return; 
    }
    this.http.post(`${environment.apiUrl}/activity/checkin`, { activity_type: activityType }).subscribe({
      next: () => {
        // Reload streak to reflect check-in
        this.loadStreak();
      },
      error: (err) => console.error('Error checking in', err)
    });
  }
}
