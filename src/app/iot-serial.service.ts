import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Reading {
  temperature: number;
  humidity: number;
  airQuality: number;
  carbonMonoxide: number;
}

@Injectable({ providedIn: 'root' })
export class IotSerialService {
  readonly supported = 'serial' in navigator;

  readonly reading$ = new BehaviorSubject<Reading | null>(null);
  readonly connected$ = new BehaviorSubject<boolean>(false);
  readonly error$ = new BehaviorSubject<string>('');
  readonly lastUpdate$ = new BehaviorSubject<Date | null>(null);

  readonly history: Record<string, number[]> = {
    temperature: [], humidity: [], airQuality: [], carbonMonoxide: []
  };

  private port: any;
  private reader: any;
  private keepReading = false;
  private busy = false;

  /** Reconnects silently to a device the user already allowed before. */
  async autoConnect() {
    if (!this.supported || this.connected$.value || this.busy) return;
    try {
      const ports = await (navigator as any).serial.getPorts();
      if (ports.length > 0) {
        await this.open(ports[0], true);
      }
    } catch { /* ignore */ }
  }

  /** Shows the browser's port picker (needs a button click). */
  async connect() {
    if (!this.supported || this.connected$.value || this.busy) return;
    try {
      const port = await (navigator as any).serial.requestPort();
      await this.open(port, false);
    } catch {
      this.error$.next('No device selected. Click Connect device and choose COM5.');
    }
  }

  async disconnect() {
    this.keepReading = false;
    try { await this.reader?.cancel(); } catch { /* ignore */ }
  }

  private async open(port: any, silent: boolean) {
    this.busy = true;
    this.error$.next('');
    try {
      await port.open({ baudRate: 115200 });
    } catch {
      this.busy = false;
      if (!silent) {
        this.error$.next('Could not open the port. Close the Arduino Serial Monitor and try again.');
      }
      return;
    }
    this.port = port;
    this.keepReading = true;
    this.connected$.next(true);
    this.busy = false;
    this.readLoop();
  }

  private async readLoop() {
    const decoder = new TextDecoderStream();
    const closed = this.port.readable.pipeTo(decoder.writable);
    this.reader = decoder.readable.getReader();
    let buffer = '';

    try {
      while (this.keepReading) {
        const { value, done } = await this.reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const text = line.trim();
          if (text.startsWith('{')) {
            try {
              this.handle(JSON.parse(text));
            } catch { /* ignore broken line */ }
          } else {
            const m = text.match(/Temp:\s*([\d.]+).*?Hum:\s*([\d.]+).*?MQ-135:\s*(\d+).*?MQ-7:\s*(\d+)/);
            if (m) {
              this.handle({
                temperature: +m[1],
                humidity: +m[2],
                airQuality: +m[3],
                carbonMonoxide: +m[4]
              });
            }
          }
        }
      }
    } catch {
      this.error$.next('Connection lost. Check the USB cable and connect again.');
    } finally {
      try { await closed; } catch { /* ignore */ }
      try { await this.port.close(); } catch { /* ignore */ }
      this.connected$.next(false);
    }
  }

  private handle(r: Reading) {
    const keys: (keyof Reading)[] = ['temperature', 'humidity', 'airQuality', 'carbonMonoxide'];
    for (const k of keys) {
      const h = this.history[k];
      h.push(r[k]);
      if (h.length > 30) h.shift();
    }
    this.lastUpdate$.next(new Date());
    this.reading$.next(r);
  }
}
