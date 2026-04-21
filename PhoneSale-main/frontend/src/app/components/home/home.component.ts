import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PhoneService } from '../../services/phone.service';
import { Category, Phone } from '../../models/models';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  featuredPhones: Phone[] = [];
  loading = true;

  constructor(
    private phoneService: PhoneService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.phoneService.getCategories().subscribe({
      next: cats => this.categories = cats
    });

    this.phoneService.getPhones().subscribe({
      next: phones => {
        this.featuredPhones = phones.slice(0, 4);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  // Цвет верхней линии и иконки
  getCatColor(name: string): string {
    const map: Record<string, string> = {
      'Flagship': '#7F77DD',
      'Mid-Range': '#378ADD',
      'Budget': '#1D9E75',
      'Foldable': '#D4537E',
      'Gaming': '#EF9F27',
      'Rugged': '#888780',
    };
    return map[name] ?? '#6366f1';
  }

  // Фон под иконкой
  getCatBg(name: string): string {
    const map: Record<string, string> = {
      'Flagship': '#EEEDFE',
      'Mid-Range': '#E6F1FB',
      'Budget': '#E1F5EE',
      'Foldable': '#FBEAF0',
      'Gaming': '#FAEEDA',
      'Rugged': '#F1EFE8',
    };
    return map[name] ?? 'rgba(99,102,241,0.1)';
  }

  //SVG иконки
  getCatIcon(name: string): SafeHtml {
    const icons: Record<string, string> = {
      'Flagship': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>`,

      'Mid-Range': `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h7l-1 8 12-14h-7l1-6z"/>
      </svg>`,

      'Budget': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,

      'Foldable': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="9" height="18" rx="2"/><rect x="13" y="3" width="9" height="18" rx="2"/></svg>`,

      'Gaming': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <path d="M6 10h12a4 4 0 0 1 3.8 5.2l-1 3A3 3 0 0 1 18 20h-2a2 2 0 0 1-2-2v-1h-4v1a2 2 0 0 1-2 2H6a3 3 0 0 1-2.8-1.8l-1-3A4 4 0 0 1 6 10z"/>
      <line x1="8" y1="13" x2="8" y2="17"/>
      <line x1="6" y1="15" x2="10" y2="15"/>
      <circle cx="16" cy="14" r="1"/>
      <circle cx="18" cy="16" r="1"/>
      </svg>`,

      'Rugged': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    };

    const svg = icons[name] ??
      `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="2" width="10" height="20" rx="2"/></svg>`;

    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}