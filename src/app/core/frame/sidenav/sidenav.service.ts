import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {

  private sidenavOpenSubject = new BehaviorSubject<boolean>(false);
  public sidenavOpen$ = this.sidenavOpenSubject.asObservable();

  toggleSidenav(): void {
    this.sidenavOpenSubject.next(!this.sidenavOpenSubject.value);
  }

  closeSidenav(): void {
    this.sidenavOpenSubject.next(false);
  }

  openSidenav(): void {
    this.sidenavOpenSubject.next(true);
  }
}