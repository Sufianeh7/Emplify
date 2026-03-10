import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlFichajesPage } from './control-fichajes.page';

describe('ControlFichajesPage', () => {
  let component: ControlFichajesPage;
  let fixture: ComponentFixture<ControlFichajesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlFichajesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
