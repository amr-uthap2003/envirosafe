import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { IotSerialService, Reading } from './iot-serial.service';

type Level = 'good' | 'warn' | 'bad';

interface Card {
  key: keyof Reading;
  title: string;
  sensor: string;
  icon: string;
  unit: string;
  value: string;
  status: string;
  level: Level;
  percent: number;
  spark: string;
}

@Component({
  selector: 'app-iot-live',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <header>
        <div>
          <h1>🌿 EnviroSafe</h1>
          <p class="sub">Live environment monitoring</p>
        </div>
        <div class="actions">
          <span class="pill" [class.live]="connected">
            <span class="dot"></span>{{ connected ? 'Live' : 'Disconnected' }}
          </span>
          <button class="btn" *ngIf="supported && !connected" (click)="connect()">Connect device</button>
          <button class="btn stop" *ngIf="connected" (click)="disconnect()">Disconnect</button>
        </div>
      </header>

      <p class="msg error" *ngIf="!supported">
        This browser does not support USB serial. Please open this page in Chrome or Edge.
      </p>
      <p class="msg error" *ngIf="error">{{ error }}</p>

      <div class="alert" *ngIf="alertText">⚠️ {{ alertText }}</div>

      <div class="empty" *ngIf="!cards.length && supported">
        <div class="big">🔌</div>
        <p>Plug in the ESP32, close the Arduino Serial Monitor, then click <b>Connect device</b>.</p>
      </div>

      <div class="grid" *ngIf="cards.length">
        <div class="card" *ngFor="let c of cards; trackBy: trackKey" [ngClass]="c.level">
          <div class="top">
            <div class="icon">{{ c.icon }}</div>
            <div>
              <div class="title">{{ c.title }}</div>
              <div class="sensor">{{ c.sensor }}</div>
            </div>
          </div>

          <div class="reading">
            <span class="value">{{ c.value }}</span>
            <span class="unit">{{ c.unit }}</span>
          </div>

          <span class="badge" [ngClass]="c.level">{{ c.status }}</span>

          <div class="bar"><div class="fill" [ngClass]="c.level" [style.width.%]="c.percent"></div></div>

          <svg class="spark" viewBox="0 0 120 36" preserveAspectRatio="none">
            <path [attr.d]="c.spark" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <p class="time" *ngIf="lastUpdate">Last updated {{ lastUpdate | date:'mediumTime' }}</p>
      <p class="note" *ngIf="cards.length">
        Gas values are raw sensor readings, not ppm. Status levels are approximate and can be adjusted.
      </p>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: linear-gradient(160deg, #0b1d26, #0f3d3e 60%, #14532d); color: #e8f1f2; font-family: 'Segoe UI', Arial, sans-serif; }
    .page { max-width: 1000px; margin: 0 auto; padding: 28px 20px; }
    header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 14px; margin-bottom: 24px; }
    h1 { margin: 0; font-size: 28px; }
    .sub { margin: 4px 0 0; color: #9cb8bb; }
    .actions { display: flex; align-items: center; gap: 12px; }
    .pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 20px; background: rgba(255,255,255,0.08); font-size: 14px; }
    .pill .dot { width: 9px; height: 9px; border-radius: 50%; background: #94a3b8; }
    .pill.live .dot { background: #4ade80; box-shadow: 0 0 8px #4ade80; animation: pulse 1.5s infinite; }
    @keyframes pulse { 50% { opacity: 0.4; } }
    .btn { padding: 10px 18px; border: none; border-radius: 10px; background: #22c55e; color: #052e16; font-weight: 600; font-size: 15px; cursor: pointer; }
    .btn:hover { background: #4ade80; }
    .btn.stop { background: #ef4444; color: #fff; }
    .msg { padding: 10px 14px; border-radius: 10px; }
    .msg.error { background: rgba(239,68,68,0.18); color: #fecaca; }
    .alert { padding: 14px 18px; border-radius: 12px; background: rgba(239,68,68,0.22); border: 1px solid #ef4444; color: #fecaca; font-weight: 600; margin-bottom: 20px; }
    .empty { text-align: center; padding: 60px 20px; color: #9cb8bb; }
    .empty .big { font-size: 56px; margin-bottom: 10px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 18px; }
    .card { padding: 20px; border-radius: 18px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(6px); }
    .card.bad { border-color: #ef4444; }
    .top { display: flex; align-items: center; gap: 12px; }
    .icon { font-size: 28px; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: rgba(255,255,255,0.1); }
    .title { font-weight: 600; }
    .sensor { font-size: 12px; color: #9cb8bb; }
    .reading { margin: 18px 0 8px; }
    .value { font-size: 42px; font-weight: 700; }
    .unit { margin-left: 6px; color: #9cb8bb; }
    .badge { display: inline-block; padding: 3px 12px; border-radius: 12px; font-size: 13px; font-weight: 600; }
    .badge.good { background: rgba(74,222,128,0.2); color: #86efac; }
    .badge.warn { background: rgba(250,204,21,0.2); color: #fde68a; }
    .badge.bad { background: rgba(239,68,68,0.25); color: #fca5a5; }
    .bar { height: 8px; border-radius: 6px; background: rgba(255,255,255,0.12); margin: 16px 0 12px; overflow: hidden; }
    .fill { height: 100%; border-radius: 6px; transition: width 0.6s ease; }
    .fill.good { background: #4ade80; }
    .fill.warn { background: #facc15; }
    .fill.bad { background: #ef4444; }
    .spark { width: 100%; height: 36px; }
    .card.good .spark path { stroke: #4ade80; }
    .card.warn .spark path { stroke: #facc15; }
    .card.bad .spark path { stroke: #ef4444; }
    .time { text-align: center; margin-top: 22px; color: #9cb8bb; font-size: 13px; }
    .note { text-align: center; color: #6f8f94; font-size: 12px; }
  `]
})
export class IotLiveComponent implements OnInit, OnDestroy {
  cards: Card[] = [];
  alertText = '';
  connected = false;
  error = '';
  lastUpdate: Date | null = null;
  supported: boolean;

  private subs = new Subscription();

  constructor(private iot: IotSerialService, private cd: ChangeDetectorRef) {
    this.supported = iot.supported;
  }

  ngOnInit() {
    this.subs.add(this.iot.connected$.subscribe(v => { this.connected = v; this.cd.markForCheck(); }));
    this.subs.add(this.iot.error$.subscribe(v => { this.error = v; this.cd.markForCheck(); }));
    this.subs.add(this.iot.lastUpdate$.subscribe(v => { this.lastUpdate = v; this.cd.markForCheck(); }));
    this.subs.add(this.iot.reading$.subscribe(r => {
      if (r) this.buildCards(r);
      this.cd.markForCheck();
    }));
    this.iot.autoConnect();
  }

  ngOnDestroy() {
    // Only stop listening. The USB connection stays open in the service.
    this.subs.unsubscribe();
  }

  trackKey(_: number, c: Card) { return c.key; }

  connect() { this.iot.connect(); }
  disconnect() { this.iot.disconnect(); }

  private buildCards(r: Reading) {
    this.cards = [
      this.makeCard('temperature', 'Temperature', 'DHT11', '🌡️', '°C', r.temperature.toFixed(1), r.temperature, r.temperature / 50 * 100),
      this.makeCard('humidity', 'Humidity', 'DHT11', '💧', '%', r.humidity.toFixed(0), r.humidity, r.humidity),
      this.makeCard('airQuality', 'Air Quality', 'MQ-135', '🌫️', 'raw', String(r.airQuality), r.airQuality, r.airQuality / 1500 * 100),
      this.makeCard('carbonMonoxide', 'Carbon Monoxide', 'MQ-7', '☁️', 'raw', String(r.carbonMonoxide), r.carbonMonoxide, r.carbonMonoxide / 1500 * 100)
    ];
    const bad = this.cards.filter(c => c.level === 'bad').map(c => c.title);
    this.alertText = bad.length ? 'High level detected: ' + bad.join(', ') : '';
  }

  private makeCard(key: keyof Reading, title: string, sensor: string, icon: string,
    unit: string, value: string, raw: number, percent: number): Card {
    const s = this.evaluate(key, raw);
    return {
      key, title, sensor, icon, unit, value,
      status: s.status, level: s.level,
      percent: Math.max(4, Math.min(100, percent)),
      spark: this.sparkPath(this.iot.history[key])
    };
  }

  private evaluate(key: keyof Reading, v: number): { status: string; level: Level } {
    switch (key) {
      case 'temperature':
        if (v > 35) return { status: 'Very hot', level: 'bad' };
        if (v > 30) return { status: 'Warm', level: 'warn' };
        if (v < 18) return { status: 'Cool', level: 'warn' };
        return { status: 'Comfortable', level: 'good' };
      case 'humidity':
        if (v > 90) return { status: 'Very humid', level: 'bad' };
        if (v > 70) return { status: 'Humid', level: 'warn' };
        if (v < 30) return { status: 'Dry', level: 'warn' };
        return { status: 'Comfortable', level: 'good' };
      case 'airQuality':
        if (v >= 800) return { status: 'Poor', level: 'bad' };
        if (v >= 400) return { status: 'Moderate', level: 'warn' };
        return { status: 'Good', level: 'good' };
      default:
        if (v >= 800) return { status: 'High', level: 'bad' };
        if (v >= 400) return { status: 'Elevated', level: 'warn' };
        return { status: 'Normal', level: 'good' };
    }
  }

  private sparkPath(data: number[]): string {
    if (data.length < 2) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    return data.map((v, i) => {
      const x = (i / (data.length - 1)) * 120;
      const y = 32 - ((v - min) / range) * 28;
      return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
    }).join(' ');
  }
}
