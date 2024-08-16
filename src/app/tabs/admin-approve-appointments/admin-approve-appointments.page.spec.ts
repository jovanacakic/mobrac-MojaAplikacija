import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminApproveAppointmentsPage } from './admin-approve-appointments.page';

describe('AdminApproveAppointmentsPage', () => {
  let component: AdminApproveAppointmentsPage;
  let fixture: ComponentFixture<AdminApproveAppointmentsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AdminApproveAppointmentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
