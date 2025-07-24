import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-root',
    imports: [NgbNavModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'renderer';
  tabActive = 1;

  constructor(){
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
  }
}
