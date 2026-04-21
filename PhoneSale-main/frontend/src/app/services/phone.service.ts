import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Phone, Category } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PhoneService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getPhones(categoryId?: number): Observable<Phone[]> {
    let params = new HttpParams();
    if (categoryId) params = params.set('category', categoryId.toString());
    return this.http.get<Phone[]>(`${this.apiUrl}/phones/`, { params });
  }

  getPhone(id: number): Observable<Phone> {
    return this.http.get<Phone>(`${this.apiUrl}/phones/${id}/`);
  }

  searchPhones(query: string, brand?: string, minPrice?: number, maxPrice?: number, categoryId?: number): Observable<any> {
    let params = new HttpParams();
    if (query) params = params.set('query', query);
    if (brand) params = params.set('brand', brand);
    if (minPrice != null) params = params.set('min_price', minPrice.toString());
    if (maxPrice != null) params = params.set('max_price', maxPrice.toString());
    if (categoryId) params = params.set('category_id', categoryId.toString());
    return this.http.get<any>(`${this.apiUrl}/phones/search/`, { params });
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories/`);
  }
}