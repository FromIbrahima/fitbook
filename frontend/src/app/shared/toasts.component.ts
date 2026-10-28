import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-toasts',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toasts" aria-live="polite">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast toast-{{ t.type }}" (click)="toast.fermer(t.id)">
          <app-icon [nom]="t.type === 'erreur' ? 'x' : 'check'" [taille]="16" /> {{ t.texte }}
        </div>
      }
    </div>`,
})
export class ToastsComponent {
  protected readonly toast = inject(ToastService);
}
