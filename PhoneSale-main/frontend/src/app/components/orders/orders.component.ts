import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  error = '';
  expandedOrderId: number | null = null;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getOrders().subscribe({
      next: orders => { this.orders = orders; this.loading = false; },
      error: () => { this.error = 'Failed to load orders.'; this.loading = false; }
    });
  }

  toggleOrder(id: number): void {
    this.expandedOrderId = this.expandedOrderId === id ? null : id;
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      pending: '#f59e0b', confirmed: '#6366f1', shipped: '#3b82f6', delivered: '#22c55e', cancelled: '#ef4444'
    };
    return map[status] || '#fff';
  }
}