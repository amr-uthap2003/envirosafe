import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-environmental-data',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './environmental-data.html',
  styleUrl: './environmental-data.css'
})
export class EnvironmentalData {

}
