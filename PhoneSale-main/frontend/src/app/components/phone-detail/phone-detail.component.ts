import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhoneService } from '../../services/phone.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Phone } from '../../models/models';

@Component({
  selector: 'app-phone-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './phone-detail.component.html',
  styleUrls: ['./phone-detail.component.scss']
})
export class PhoneDetailComponent implements OnInit {
  phone: Phone | null = null;
  loading = true;
  error = '';
  successMsg = '';
  quantity = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private phoneService: PhoneService,
    private cartService: CartService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/phones']); return; }
    this.phoneService.getPhone(+id).subscribe({
      next: phone => { this.phone = phone; this.loading = false; },
      error: () => { this.error = 'Phone not found.'; this.loading = false; }
    });
  }

  addToCart(): void {
    if (!this.phone) return;
    if (!this.authService.isLoggedIn()) { this.router.navigate(['/login']); return; }
    this.cartService.addToCart(this.phone.id, this.quantity).subscribe({
      next: () => { this.successMsg = 'Added to cart!'; setTimeout(() => this.successMsg = '', 3000); },
      error: () => this.error = 'Failed to add to cart.'
    });
  }

  increment(): void { if (this.phone && this.quantity < this.phone.stock) this.quantity++; }
  decrement(): void { if (this.quantity > 1) this.quantity--; }
}