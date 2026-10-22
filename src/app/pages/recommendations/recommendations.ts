import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval, startWith, switchMap, forkJoin, catchError, of } from 'rxjs';

import { Layout } from '../../layout/layout';

interface Advice {
  air: string; water: string; noise: string; temp: string; waste: string;
  preventive: string; inspector: string;
}

// Industry-type specific advice (rule-based)
const ADVICE: Record<string, Advice> = {
  textile: {
    air: 'Install fume and lint extraction on dyeing, drying and finishing lines; service boiler stacks.',
    water: 'Neutralise dye-bath effluent and route it through an effluent treatment plant before discharge.',
    noise: 'Add enclosures or dampers to looms and spinning machines; give workers ear protection.',
    temp: 'Improve ventilation in dyeing and drying halls; service steam lines and chillers.',
    waste: 'Segregate fabric waste and dye sludge; send sludge only to authorised handlers.',
    preventive: 'Keep up regular effluent pH checks and dye-house ventilation maintenance.',
    inspector: 'Verify the effluent treatment plant, dye chemical storage and fabric waste records.'
  },
  chemical: {
    air: 'Check scrubbers and vent condensers; inspect for chemical leaks and fugitive emissions.',
    water: 'Neutralise process wastewater and confirm the treatment unit is dosing correctly.',
    noise: 'Inspect compressors, pumps and relief valves; add silencers where needed.',
    temp: 'Check reactor cooling loops and heat exchangers; review temperature interlocks.',
    waste: 'Label and store hazardous waste in compatible containers; use licensed disposal only.',
    preventive: 'Keep scrubbers, leak detection and hazardous waste logs up to date.',
    inspector: 'Verify hazardous waste storage, leak detection, scrubber records and emergency procedures.'
  },
  pharmaceutical: {
    air: 'Check HEPA filters and solvent vapour recovery; review cleanroom air handling.',
    water: 'Treat process and cleaning effluent for solvents and active residues before discharge.',
    noise: 'Inspect HVAC units, compressors and blenders; add acoustic panels around utilities.',
    temp: 'Verify HVAC and cold-storage controls; recalibrate temperature sensors.',
    waste: 'Dispose of expired drugs and solvent waste through authorised biomedical or hazardous channels.',
    preventive: 'Keep HVAC, filter and solvent recovery maintenance on schedule.',
    inspector: 'Verify solvent handling, effluent treatment for active residues and drug waste disposal records.'
  },
  cement: {
    air: 'Check bag filters and electrostatic precipitators; suppress dust at crushing, kiln and conveyor points.',
    water: 'Control alkaline runoff; recycle cooling and wash water through settling ponds.',
    noise: 'Add enclosures around crushers, mills and fans; maintain bearings and liners.',
    temp: 'Inspect kiln and cooler insulation; improve ventilation near hot zones.',
    waste: 'Reuse kiln dust where permitted; dispose of residual dust and refractory waste properly.',
    preventive: 'Keep dust collectors, kiln insulation and water recycling in good working order.',
    inspector: 'Verify dust control equipment, stack emission records and kiln dust handling.'
  },
  food: {
    air: 'Clean exhaust hoods and ducts; control odour from cooking, drying and waste areas.',
    water: 'Treat organic-load effluent (grease, starch); clean grease traps and check pH balance.',
    noise: 'Maintain conveyors, packaging lines and compressors; add noise barriers.',
    temp: 'Check refrigeration, boilers and cold chain; maintain safe processing temperatures.',
    waste: 'Separate organic waste for composting or biogas; keep waste bins covered and collected daily.',
    preventive: 'Keep grease traps, refrigeration and organic waste collection on a regular schedule.',
    inspector: 'Verify hygiene and effluent controls, grease trap cleaning and organic waste handling.'
  },
  paper: {
    air: 'Control odorous sulphur compounds and boiler emissions; service stack scrubbers.',
    water: 'Treat pulping effluent (high organic load and colour); recycle process water where possible.',
    noise: 'Inspect pulpers, dryers and paper machines; add damping and enclosures.',
    temp: 'Check dryer sections, steam lines and heat recovery; improve ventilation.',
    waste: 'Recycle pulp sludge and fibre waste; dispose of chemical residues properly.',
    preventive: 'Keep effluent treatment, water recycling and boiler emission control maintained.',
    inspector: 'Verify pulping effluent treatment, boiler emissions and sludge disposal records.'
  },
  steel: {
    air: 'Service furnace dust extraction and bag filters; control slag and coke handling dust.',
    water: 'Treat cooling and quench water for oil, metals and acidity before reuse or discharge.',
    noise: 'Add enclosures to furnaces, rolling mills and cutting areas; provide hearing protection.',
    temp: 'Inspect furnace linings and cooling systems; provide heat-stress controls for workers.',
    waste: 'Reuse slag where permitted; store mill scale and used oil in authorised containers.',
    preventive: 'Keep furnace dust control, cooling water treatment and slag handling on schedule.',
    inspector: 'Verify furnace emission controls, slag storage and cooling water treatment records.'
  },
  general: {
    air: 'Service ventilation and filtration systems and review emission sources.',
    water: 'Treat effluent to bring pH within the allowed range before discharge.',
    noise: 'Add noise insulation or adjust machine schedules; provide ear protection.',
    temp: 'Improve cooling and ventilation; check equipment for overheating.',
    waste: 'Use authorised waste handling and retrain staff on segregation.',
    preventive: 'Continue regular monitoring and calibrate sensors on schedule.',
    inspector: 'Verify emission controls, effluent treatment and waste handling records.'
  }
};

interface Item { parameter: string; value: string; ok: boolean; advice: string; }

interface ManualRec {
  id: number;
  sourceType: string;
  sourceId: number;
  text: string;
  createdByName: string;
  createdAt: string;
}

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, FormsModule, Layout],
  templateUrl: './recommendations.html',
  styleUrl: './recommendations.css'
})
export class Recommendations implements OnInit, OnDestroy {
  industryName = '';
  industryType = '';
  selected: 'employee' | 'inspector' = 'employee';

  readings: any[] = [];
  reports: any[] = [];

  // Manual recommendations grouped by "Employee-5" / "Inspector-3"
  manual: Record<string, ManualRec[]> = {};
  drafts: Record<string, string> = {};

  error = '';
  private managerId = 0;
  private sub?: Subscription;

  private readonly api = 'http://localhost:5180/api/industry-manager';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    const stored = localStorage.getItem('currentUser');
    if (!stored) { this.error = 'Please log in again.'; return; }

    try { this.managerId = JSON.parse(stored).id; }
    catch { this.error = 'Invalid login data. Please log in again.'; return; }

    this.sub = interval(10000).pipe(
      startWith(0),
      switchMap(() => forkJoin({
        data: this.http.get<any>(`${this.api}/${this.managerId}/reports`),
        // If the manual endpoint is not ready yet, the automatic recommendations still show
        manual: this.http.get<ManualRec[]>(`${this.api}/${this.managerId}/manual-recommendations`)
          .pipe(catchError(() => of([] as ManualRec[])))
      }))
    ).subscribe({
      next: ({ data, manual }) => {
        this.industryName = data.industryName;
        this.industryType = data.industryType || '';
        const a = this.advice;

        // AUTOMATIC recommendations for employee readings (kept)
        this.readings = (data.employeeReadings || []).map((r: any) => {
          const items: Item[] = [
            { parameter: 'Air Quality', value: `${r.airQuality}`, ok: r.airQuality <= 100, advice: a.air },
            { parameter: 'Water pH', value: `${r.waterPh}`, ok: r.waterPh >= 6.5 && r.waterPh <= 8.5, advice: a.water },
            { parameter: 'Noise Level', value: `${r.noiseLevel} dB`, ok: r.noiseLevel <= 75, advice: a.noise },
            { parameter: 'Temperature', value: `${r.temperature}°C`, ok: r.temperature <= 40, advice: a.temp },
            { parameter: 'Waste Disposal', value: r.wasteDisposal, ok: r.wasteDisposal !== 'Improper', advice: a.waste }
          ];
          return { ...r, items, issues: items.filter(i => !i.ok) };
        });

        // AUTOMATIC recommendations for inspector reports (kept)
        this.reports = (data.inspectorReports || []).map((r: any) => ({ ...r, tips: this.reportTips(r) }));

        // MANUAL recommendations grouped by source
        const grouped: Record<string, ManualRec[]> = {};
        for (const m of manual || []) {
          const k = `${m.sourceType}-${m.sourceId}`;
          (grouped[k] = grouped[k] || []).push(m);
        }
        this.manual = grouped;

        this.error = '';
        this.cdr.detectChanges();
      },
      error: e => {
        this.error = typeof e.error === 'string' ? e.error : 'Could not load recommendations.';
        this.cdr.detectChanges();
      }
    });
  }

  // Stops the cards (and what you are typing) from being rebuilt on every refresh
  trackById(_: number, item: any): number { return item.id; }

  // ---------- Manual recommendations ----------
  manualFor(type: string, id: number): ManualRec[] {
    return this.manual[`${type}-${id}`] || [];
  }

  addManual(type: 'Employee' | 'Inspector', id: number): void {
    const key = `${type}-${id}`;
    const text = (this.drafts[key] || '').trim();
    if (!text) return;

    this.http.post<ManualRec>(`${this.api}/${this.managerId}/manual-recommendations`,
      { sourceType: type, sourceId: id, text }).subscribe({
        next: rec => {
          this.manual[key] = [rec, ...(this.manual[key] || [])];
          this.drafts[key] = '';
          this.error = '';
          this.cdr.detectChanges();
        },
        error: e => {
          this.error = typeof e.error === 'string' ? e.error : 'Could not save the recommendation.';
          this.cdr.detectChanges();
        }
      });
  }

  removeManual(type: string, id: number, rec: ManualRec): void {
    if (!confirm('Delete this recommendation?')) return;

    this.http.delete(`${this.api}/${this.managerId}/manual-recommendations/${rec.id}`).subscribe({
      next: () => {
        const key = `${type}-${id}`;
        this.manual[key] = (this.manual[key] || []).filter(m => m.id !== rec.id);
        this.cdr.detectChanges();
      },
      error: e => {
        this.error = typeof e.error === 'string' ? e.error : 'Could not delete the recommendation.';
        this.cdr.detectChanges();
      }
    });
  }

  // ---------- Automatic advice ----------
  // Finds the advice set for the industry type (e.g. "Textile Industry" matches "textile")
  get advice(): Advice {
    const t = (this.industryType || '').toLowerCase();
    const key = Object.keys(ADVICE).find(k => k !== 'general' && t.includes(k));
    return ADVICE[key ?? 'general'];
  }

  get preventiveTip(): string { return this.advice.preventive; }

  private reportTips(r: any): string[] {
    const tips: string[] = [];
    if (r.complianceStatus === 'Non-Compliant')
      tips.push('Fix the reported violations and request a re-inspection as soon as possible.');
    else if (r.complianceStatus === 'Under Review')
      tips.push('Keep all monitoring records ready until the review is finished.');
    else
      tips.push('Industry is compliant. Maintain current practices.');

    if (r.activeViolations > 0)
      tips.push(`Assign an owner and a deadline to each of the ${r.activeViolations} active violation(s).`);

    if (r.riskLevel === 'High')
      tips.push('High risk: act immediately and increase the monitoring frequency.');
    else if (r.riskLevel === 'Medium')
      tips.push('Medium risk: schedule preventive maintenance and review controls within the month.');
    else
      tips.push('Low risk: continue routine monitoring.');

    tips.push(this.advice.inspector);
    return tips;
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
