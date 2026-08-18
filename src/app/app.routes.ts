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

  // Risk Prediction
  {
    path: 'risk-prediction',
    component: RiskPrediction
  },
  // recommendations
  {
    path: 'recommendations',
    component: Recommendations
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
  // Invalid URL
  {
    path: '**',
    redirectTo: ''
  }

];
