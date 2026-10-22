import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Services } from './pages/services/services';
import { Contact } from './pages/contact/contact';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { IndustryManagerDashboard } from './pages/industry-manager-dashboard/industry-manager-dashboard';
import { ManageIndustries } from './pages/manage-industries/manage-industries';
import { ComplianceStandards } from './pages/compliance-standards/compliance-standards';
import { EnvironmentalData } from './pages/environmental-data/environmental-data';
import { RiskPrediction } from './pages/risk-prediction/risk-prediction';
import { Recommendations } from './pages/recommendations/recommendations';
import { Reports } from './reports/reports';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { ManageUsers } from './pages/manage-users/manage-users';
import { AdminIndustries } from './pages/admin-industries/admin-industries';
import { AdminComplianceStandards } from './pages/admin-compliance-standards/admin-compliance-standards';
import { AdminReports } from './pages/admin-reports/admin-reports';
import { EmployeeDashboard } from './pages/employee-dashboard/employee-dashboard';
import { SubmitReading } from './pages/submit-reading/submit-reading';
import { MySubmissions } from './pages/my-submissions/my-submissions';
import { InspectorDashboard } from './pages/inspector-dashboard/inspector-dashboard';
import { InspectIndustry } from './pages/inspect-industry/inspect-industry';
import { MyInspections } from './pages/my-inspections/my-inspections';
import { EmployeeReadings } from './pages/employee-readings/employee-readings';
import { InspectorReports } from './pages/inspector-reports/inspector-reports';
import { ComplianceStatus } from './pages/compliance-status/compliance-status';
import { MyRecommendations } from './pages/my-recommendations/my-recommendations';
import { Notifications } from './pages/notifications/notifications';
import { CorrectiveActions } from './pages/corrective-actions/corrective-actions';
import { MyCorrectiveActions } from './pages/my-corrective-actions/my-corrective-actions'; // NEW

export const routes: Routes = [

  // Home
  {
    path: '',
    component: Home
  },

  // Public Pages
  {
    path: 'about',
    component: About
  },

  {
    path: 'services',
    component: Services
  },

  {
    path: 'contact',
    component: Contact
  },

  // Authentication
  {
    path: 'login',
    component: Login
  },

  {
    path: 'register',
    component: Register
  },

  // Old Dashboard
  {
    path: 'dashboard',
    component: Dashboard
  },

  // Industry Manager Dashboard
  {
    path: 'industry-manager-dashboard',
    component: IndustryManagerDashboard
  },

  // Manage Industries
  {
    path: 'manage-industries',
    component: ManageIndustries
  },

  // Compliance Standards
  {
    path: 'compliance-standards',
    component: ComplianceStandards
  },

  // Environmental Data
  {
    path: 'environmental-data',
    component: EnvironmentalData
  },

  // Employee Readings (Industry Manager view)
  {
    path: 'employee-readings',
    component: EmployeeReadings
  },

  // Inspector Reports (Industry Manager view)
  {
    path: 'inspector-reports',
    component: InspectorReports
  },

  // Compliance Status (Industry Manager view)
  {
    path: 'compliance-status',
    component: ComplianceStatus
  },

  // Risk Prediction
  {
    path: 'risk-prediction',
    component: RiskPrediction
  },

  // Recommendations (Industry Manager view)
  {
    path: 'recommendations',
    component: Recommendations
  },

  // Notifications (Industry Manager view)
  {
    path: 'notifications',
    component: Notifications
  },

  // Corrective Actions (Industry Manager view)
  {
    path: 'corrective-actions',
    component: CorrectiveActions
  },

  // Reports
  {
    path: 'reports',
    component: Reports
  },

  // Admin Dashboard
  {
    path: 'admin-dashboard',
    component: AdminDashboard
  },

  // Manage Users
  {
    path: 'manage-users',
    component: ManageUsers
  },

  {
    path: 'admin-industries',
    component: AdminIndustries
  },

  {
    path: 'admin-compliance-standards',
    component: AdminComplianceStandards
  },

  {
    path: 'admin-reports',
    component: AdminReports
  },

  // Employee
  {
    path: 'employee-dashboard',
    component: EmployeeDashboard
  },

  {
    path: 'submit-reading',
    component: SubmitReading
  },

  {
    path: 'my-submissions',
    component: MySubmissions
  },

  // Inspector
  {
    path: 'inspector-dashboard',
    component: InspectorDashboard
  },

  {
    path: 'inspect-industry',
    component: InspectIndustry
  },

  {
    path: 'my-inspections',
    component: MyInspections
  },

  // Employee / Inspector: recommendations written by the manager
  {
    path: 'my-recommendations',
    component: MyRecommendations
  },

  // Employee / Inspector: corrective actions and risk (view only)  NEW
  {
    path: 'my-corrective-actions',
    component: MyCorrectiveActions
  },

  // Invalid URL (must always be the LAST route)
  {
    path: '**',
    redirectTo: ''
  }
];
