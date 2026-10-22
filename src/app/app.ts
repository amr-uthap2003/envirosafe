import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IotLiveComponent } from './iot-live.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, IotLiveComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
