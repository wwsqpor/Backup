import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/`);
  }

  checkout(shippingAddress: string): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/checkout/`, { shipping_address: shippingAddress });
  }
}