import { ChangeDetectionStrategy, Component, effect, input, signal } from '@angular/core';
import QRCode from 'qrcode';

/** Bonus : QR code de confirmation de réservation (bibliothèque « qrcode »). */
@Component({
  selector: 'app-qr-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (src()) { <img [src]="src()" [alt]="'QR code ' + texte()" width="132" height="132" class="qr anim-pop" /> }`,
  styles: `.qr { border-radius: 10px; border: 1px solid var(--bordure); background: #fff; padding: 6px; }`,
})
export class QrCodeComponent {
  readonly texte = input.required<string>();
  protected readonly src = signal<string | null>(null);

  constructor() {
    effect(() => {
      QRCode.toDataURL(this.texte(), { margin: 1, width: 240, color: { dark: '#0F172A', light: '#FFFFFF' } })
        .then((url: string) => this.src.set(url))
        .catch(() => this.src.set(null));
    });
  }
}
