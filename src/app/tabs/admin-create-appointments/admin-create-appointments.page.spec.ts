import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminCreateAppointmentsPage } from './admin-create-appointments.page';

describe('AdminAppointmentsPage', () => {
  let component: AdminCreateAppointmentsPage;
  let fixture: ComponentFixture<AdminCreateAppointmentsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AdminCreateAppointmentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
