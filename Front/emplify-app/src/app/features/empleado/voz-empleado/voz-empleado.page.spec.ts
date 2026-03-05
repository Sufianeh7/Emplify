import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VozEmpleadoPage } from './voz-empleado.page';

describe('VozEmpleadoPage', () => {
  let component: VozEmpleadoPage;
  let fixture: ComponentFixture<VozEmpleadoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VozEmpleadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
