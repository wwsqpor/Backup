import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Cart, CartItem } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = 'http://localhost:8000/api/cart';
  private cartSubject = new BehaviorSubject<Cart>({ items: [], total: '0', count: 0 });
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadCart(): void {
    this.http.get<Cart>(`${this.apiUrl}/`).subscribe({
      next: cart => this.cartSubject.next(cart),
      error: () => this.cartSubject.next({ items: [], total: '0', count: 0 })
    });
  }

  addToCart(phoneId: number, quantity: number = 1): Observable<CartItem> {
    return this.http.post<CartItem>(`${this.apiUrl}/`, { phone: phoneId, quantity }).pipe(
      tap(() => this.loadCart())
    );
  }

  updateQuantity(itemId: number, quantity: number): Observable<CartItem> {
    return this.http.patch<CartItem>(`${this.apiUrl}/${itemId}/`, { quantity }).pipe(
      tap(() => this.loadCart())
    );
  }

  removeItem(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${itemId}/`).pipe(
      tap(() => this.loadCart())
    );
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/`).pipe(
      tap(() => this.cartSubject.next({ items: [], total: '0', count: 0 }))
    );
  }

  get cartCount(): number { return this.cartSubject.value.count; }
}