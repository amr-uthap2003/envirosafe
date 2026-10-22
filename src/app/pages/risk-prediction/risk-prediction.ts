import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Layout } from '../../layout/layout';
import { ReportPrediction } from './report-prediction/report-prediction';
import { RiskRules } from './risk-rules/risk-rules';

@Component({
  selector: 'app-risk-prediction',
  standalone: true,
  imports: [CommonModule, RouterLink, Layout, ReportPrediction, RiskRules],
  templateUrl: './risk-prediction.html',
  styleUrl: './risk-prediction.css'
})
export class RiskPrediction { }
