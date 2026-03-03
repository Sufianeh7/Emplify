import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionRRHHPage } from './gestion-rrhh.page';

describe('GestionRRHHPage', () => {
  let component: GestionRRHHPage;
  let fixture: ComponentFixture<GestionRRHHPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionRRHHPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
