import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/** Accès centralisé à l'API REST Symfony. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  get<T>(url: string, params?: Record<string, unknown>): Observable<T> {
    let p = new HttpParams();
    for (const [k, v] of Object.entries(params ?? {})) {
      if (v === null || v === undefined || v === '' || v === false) continue;
      p = p.set(k, Array.isArray(v) ? v.join(',') : String(v));
    }
    return this.http.get<T>(this.base + url, { params: p });
  }
  post<T>(url: string, body: unknown = {}): Observable<T> { return this.http.post<T>(this.base + url, body); }
  put<T>(url: string, body: unknown): Observable<T> { return this.http.put<T>(this.base + url, body); }
  delete<T>(url: string): Observable<T> { return this.http.delete<T>(this.base + url); }
}
