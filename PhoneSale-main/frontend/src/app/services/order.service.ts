import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/models';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/`);
  }

  checkout(shippingAddress: string): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/checkout/`, { shipping_address: shippingAddress });
  }
}