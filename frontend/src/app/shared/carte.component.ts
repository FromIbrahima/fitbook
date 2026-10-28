import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, effect, input, viewChild } from '@angular/core';
import * as L from 'leaflet';

export interface PointCarte { id: number; nom: string; lat: number | null; lng: number | null; texte?: string; lien?: string; }

/** Bonus : carte interactive (Leaflet + OpenStreetMap). */
@Component({
  selector: 'app-carte',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div #zone class="carte-leaflet" role="region" aria-label="Carte des salles"></div>`,
  styles: `.carte-leaflet { width: 100%; height: var(--hauteur-carte, 320px); border-radius: 16px; overflow: hidden; z-index: 0; }`,
})
export class CarteComponent implements AfterViewInit, OnDestroy {
  readonly points = input<PointCarte[]>([]);
  private readonly zone = viewChild.required<ElementRef<HTMLDivElement>>('zone');
  private carte?: L.Map;
  private calque = L.layerGroup();

  constructor() {
    effect(() => this.dessiner(this.points()));
  }

  ngAfterViewInit(): void {
    this.carte = L.map(this.zone().nativeElement, { scrollWheelZoom: false }).setView([50.8466, 4.3528], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18, attribution: '&copy; contributeurs OpenStreetMap',
    }).addTo(this.carte);
    this.calque.addTo(this.carte);
    this.dessiner(this.points());
  }

  ngOnDestroy(): void { this.carte?.remove(); }

  private dessiner(points: PointCarte[]): void {
    if (!this.carte) return;
    this.calque.clearLayers();
    const valides = points.filter((p) => p.lat !== null && p.lng !== null);
    for (const p of valides) {
      const icone = L.divIcon({ className: 'marqueur', html: '<span></span>', iconSize: [26, 26], iconAnchor: [13, 26] });
      const lien = p.lien ? `<br><a href="${p.lien}">Voir la fiche</a>` : '';
      L.marker([p.lat!, p.lng!], { icon: icone, title: p.nom }).bindPopup(`<strong>${p.nom}</strong><br>${p.texte ?? ''}${lien}`).addTo(this.calque);
    }
    if (valides.length > 1) {
      this.carte.fitBounds(L.latLngBounds(valides.map((p) => [p.lat!, p.lng!] as L.LatLngTuple)), { padding: [30, 30] });
    } else if (valides.length === 1) {
      this.carte.setView([valides[0].lat!, valides[0].lng!], 15);
    }
  }
}
