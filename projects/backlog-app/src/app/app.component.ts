import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LoggerService } from 'projects/shared/src/public-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public title = 'backlog-app';
  public titleFormControl = new FormControl(this.title);

  constructor(private logger: LoggerService) {
    this.logger.info('constructor')
    this.titleFormControl.valueChanges.forEach(v => this.title = v);
  }
}
