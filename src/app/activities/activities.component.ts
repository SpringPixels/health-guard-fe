import { Component, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivityService } from './activity.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-activities',
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule
  ],
  templateUrl: './activities.html',
})
export class ActivitiesComponent implements OnInit {
  private activityService = inject(ActivityService);
  private fb = inject(FormBuilder);

  public currentStreak = this.activityService.currentStreak;
  public hasCheckedInToday = this.activityService.hasCheckedInToday;
  public recommendedActivity = this.activityService.recommendedActivity;
  public streakMessage = this.activityService.streakMessage;
  public last7Days = this.activityService.last7Days;

  public checkInForm = this.fb.group({
    activityType: ['', Validators.required]
  });

  constructor() {
    // When recommendation changes, update the form if it's empty
    effect(() => {
      const rec = this.recommendedActivity();
      if (rec && !this.checkInForm.value.activityType) {
        this.checkInForm.patchValue({ activityType: rec });
      }
    });
  }

  ngOnInit() {
    this.activityService.loadStreak();
    this.activityService.loadRecommendation();
  }

  // UI mapping for the calendar
  public calendarDays = computed(() => {
    const list = this.last7Days();
    return list.map(item => {
      const d = new Date(item.date);
      return {
        dateStr: item.date,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: item.completed
      };
    });
  });

  public thisMonthCount = computed(() => {
    const list = this.last7Days();
    const currentMonth = new Date().getMonth();
    // Note: The backend only returns the last 7 days currently, 
    // so this is a simplified monthly count. If the backend returned full history, this would be more accurate.
    // For now, it just counts the workouts in the returned list that fall in this month.
    return list.filter(c => c.completed && new Date(c.date).getMonth() === currentMonth).length;
  });

  submitCheckIn() {
    if (this.checkInForm.valid && !this.hasCheckedInToday()) {
      this.activityService.checkIn(this.checkInForm.value.activityType!);
    }
  }
}
