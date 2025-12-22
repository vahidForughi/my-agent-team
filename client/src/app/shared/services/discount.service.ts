import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { IProduct, IProductWithDiscount } from '../models/product';
import { environment } from '../../../environments/environment';

export interface IDiscount {
  id: number;
  productName: string;
  description: string;
  amount: number;
}

@Injectable({
  providedIn: 'root',
})
export class DiscountService {
  private http = inject(HttpClient);

  private baseUrl = 'http://localhost:8010/';

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  // This would require a new endpoint on the backend, but for now we'll simulate it
  getDiscountForProduct(productName: string): Observable<IDiscount> {
    // Since we don't have a direct discount endpoint, we'll create a mock response
    // In a real implementation, you'd call the discount service endpoint
    return of({
      id: 0,
      productName: productName,
      description: 'No Discount',
      amount: this.getKnownDiscountAmount(productName),
    });
  }

  // Simulate known discounts based on product names
  private getKnownDiscountAmount(productName: string): number {
    const knownDiscounts: { [key: string]: number } = {
      'ASUS ZenBook 13 OLED Ultrabook': 500,
      'ASUS ROG Zephyrus G14 Gaming Laptop': 700,
      'Samsung Galaxy S23 Ultra': 300,
      'iPhone 15 Pro Max': 1000,
      'MacBook Pro M3': 1500,
      'AirPods Pro': 200,
    };

    return knownDiscounts[productName] || 0;
  }

  // Enrich a single product with discount information
  enrichProductWithDiscount(
    product: IProduct
  ): Observable<IProductWithDiscount> {
    return this.getDiscountForProduct(product.name).pipe(
      map((discount) => ({
        ...product,
        originalPrice: product.price,
        discountAmount: discount.amount,
        hasDiscount: discount.amount > 0,
        price: product.price - discount.amount, // Update price with discount applied
      })),
      catchError(() =>
        of({
          ...product,
          originalPrice: product.price,
          discountAmount: 0,
          hasDiscount: false,
        })
      )
    );
  }

  // Enrich multiple products with discount information
  enrichProductsWithDiscounts(
    products: IProduct[]
  ): Observable<IProductWithDiscount[]> {
    const discountRequests = products.map((product) =>
      this.enrichProductWithDiscount(product)
    );

    return forkJoin(discountRequests);
  }
}
