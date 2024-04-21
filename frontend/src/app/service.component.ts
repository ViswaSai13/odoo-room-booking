import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BookingService {
  apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getAvailability(roomId, currentSlot, date) {
    return this.http.get<any>(
      `${this.apiUrl}/v1/nextAvailability?roomId=${roomId}&currentSlot=${currentSlot}&date=${date}`
    );
  }

  getFacilities() {
    return this.http.get<any>(`${this.apiUrl}/v1/facilities`);
  }

  getRooms(reqBody) {
    return this.http.post<any>(`${this.apiUrl}/v1/roomsList`, reqBody);
  }

  getBooking(date, roomId) {
    return this.http.get<any>(
      `${this.apiUrl}/v1/bookings?date=${date}&roomId=${roomId}`
    );
  }

  updateBooking(reqBody): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/v1/bookings/update`, reqBody);
  }
}
