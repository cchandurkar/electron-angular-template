import { Component } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-root',
    imports: [NgbNavModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'renderer';
  tabActive = 1;

  constructor(){
  }

}
