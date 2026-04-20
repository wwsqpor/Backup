import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhoneService } from '../../services/phone.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Phone, Category } from '../../models/models';

@Component({
  selector: 'app-phones',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './phones.component.html',
  styleUrls: ['./phones.component.scss']
})
export class PhonesComponent implements OnInit {
  phones: Phone[] = [];
  categories: Category[] = [];
  loading = true;
  error = '';
  successMsg = '';

  // Form controls with [(ngModel)] - requirement: at least 4
  searchQuery = '';
  selectedBrand = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  selectedCategory: number | null = null;

  brands = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi'];

  constructor(
    private phoneService: PhoneService,
    private cartService: CartService,
    public authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.phoneService.getCategories().subscribe(cats => this.categories = cats);
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = +params['category'];
      }
      this.loadPhones();
    });
  }

  loadPhones(): void {
    this.loading = true;
    this.error = '';
    if (this.searchQuery || this.selectedBrand || this.minPrice || this.maxPrice || this.selectedCategory) {
      this.phoneService.searchPhones(
        this.searchQuery, this.selectedBrand,
        this.minPrice ?? undefined, this.maxPrice ?? undefined,
        this.selectedCategory ?? undefined
      ).subscribe({
        next: res => { this.phones = res.results || res; this.loading = false; },
        error: () => { this.error = 'Failed to load phones.'; this.loading = false; }
      });
    } else {
      this.phoneService.getPhones().subscribe({
        next: phones => { this.phones = phones; this.loading = false; },
        error: () => { this.error = 'Failed to load phones.'; this.loading = false; }
      });
    }
  }

  // (click) event 1: search
  onSearch(): void { this.loadPhones(); }

  // (click) event 2: reset filters
  onReset(): void {
    this.searchQuery = ''; this.selectedBrand = '';
    this.minPrice = null; this.maxPrice = null; this.selectedCategory = null;
    this.loadPhones();
  }

  // (click) event 3: add to cart
  addToCart(phone: Phone, event: Event): void {
    event.preventDefault(); event.stopPropagation();
    if (!this.authService.isLoggedIn()) { this.error = 'Please login to add items to cart.'; return; }
    this.cartService.addToCart(phone.id).subscribe({
      next: () => { this.successMsg = `${phone.name} added to cart!`; setTimeout(() => this.successMsg = '', 3000); },
      error: () => { this.error = 'Failed to add to cart.'; }
    });
  }

  // (click) event 4: category filter click
  filterByCategory(catId: number | null): void {
    this.selectedCategory = catId;
    this.loadPhones();
  }
}