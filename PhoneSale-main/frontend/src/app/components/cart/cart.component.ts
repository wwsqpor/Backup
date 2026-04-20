import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { Cart } from '../../models/models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cart: Cart = { items: [], total: '0', count: 0 };
  shippingAddress = '';
  loading = false;
  error = '';
  successMsg = '';
  checkingOut = false;

  constructor(private cartService: CartService, private orderService: OrderService) {}

  ngOnInit(): void {
    this.cartService.loadCart();
    this.cartService.cart$.subscribe(cart => this.cart = cart);
  }

  updateQuantity(itemId: number, quantity: number): void {
    if (quantity < 1) return;
    this.cartService.updateQuantity(itemId, quantity).subscribe({
      error: () => this.error = 'Failed to update quantity.'
    });
  }

  removeItem(itemId: number): void {
    this.cartService.removeItem(itemId).subscribe({
      error: () => this.error = 'Failed to remove item.'
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      error: () => this.error = 'Failed to clear cart.'
    });
  }

  checkout(): void {
    if (!this.shippingAddress.trim()) { this.error = 'Please enter a shipping address.'; return; }
    this.checkingOut = true;
    this.orderService.checkout(this.shippingAddress).subscribe({
      next: order => {
        this.successMsg = `Order #${order.id} placed successfully!`;
        this.shippingAddress = '';
        this.checkingOut = false;
      },
      error: () => { this.error = 'Checkout failed.'; this.checkingOut = false; }
    });
  }
}