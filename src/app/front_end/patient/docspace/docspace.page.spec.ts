import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DocspacePage } from './docspace.page';

describe('DocspacePage', () => {
  let component: DocspacePage;
  let fixture: ComponentFixture<DocspacePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocspacePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DocspacePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
