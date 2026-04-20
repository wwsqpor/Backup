import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PhoneService } from '../../services/phone.service';
import { Category, Phone } from '../../models/models';

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

  constructor(private phoneService: PhoneService) {}

  ngOnInit(): void {
    this.phoneService.getCategories().subscribe(cats => this.categories = cats);
    this.phoneService.getPhones().subscribe({
      next: phones => { this.featuredPhones = phones.slice(0, 4); this.loading = false; },
      error: () => this.loading = false
    });
  }
}