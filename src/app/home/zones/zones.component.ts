import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCol, IonRow, IonGrid, ModalController } from '@ionic/angular';
import Zonas from '../../../assets/data/Zonas.json';

@Component({
  selector: 'app-zones',
  templateUrl: './zones.component.html',
  styleUrls: ['./zones.component.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCol, IonRow, IonGrid],
})
export class ZonesComponent implements OnInit {

  geo: number = 0;
  zonas: any[] = Zonas.Zonas;
  zonasDesbloqueadas: string[] = [];

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    const saved = localStorage.getItem('clicks');
    if (saved !== null) {
      this.geo = Number(saved);
    }

    const savedZones = localStorage.getItem('enabledZones');
    if (savedZones !== null) {
      this.zonasDesbloqueadas = JSON.parse(savedZones);
    } else {
      this.zonasDesbloqueadas = [Zonas.Zonas[0].name];
      localStorage.setItem('enabledZones', JSON.stringify(this.zonasDesbloqueadas));
    }
  }

  ZonaDesbloqueada(zona: any): boolean {
    return this.zonasDesbloqueadas.includes(zona.name);
  }
  

  ElegirZona(zona: any) {
    return this.modalCtrl.dismiss(zona, 'zone');
  }

  MostrarValor(valor: number): string {
    if (valor < 1e3) {
      return valor.toLocaleString();
    } else if (valor >= 1e3 && valor < 1e6) {
      return Math.floor(valor / 1e2) / 10 + 'k';
    } else if (valor >= 1e6 && valor < 1e9) {
      return Math.floor(valor / 1e5) / 10 + 'M';
    } else if (valor >= 1e9 && valor < 1e12) {
      return Math.floor(valor / 1e8) / 10 + 'B';
    } else if (valor >= 1e12 && valor < 1e15) {
      return Math.floor(valor / 1e11) / 10 + 'T';
    } else if (valor >= 1e15 && valor < 1e18) {
      return Math.floor(valor / 1e14) / 10 + 'Qa';
    } else if (valor >= 1e18 && valor < 1e21) {
      return Math.floor(valor / 1e17) / 10 + 'Qi';
    } else if (valor >= 1e21 && valor < 1e24) {
      return Math.floor(valor / 1e20) / 10 + 'Sx';
    } else if (valor >= 1e24 && valor < 1e27) {
      return Math.floor(valor / 1e23) / 10 + 'Sp';
    } else if (valor >= 1e27 && valor < 1e30) {
      return Math.floor(valor / 1e26) / 10 + 'Oc';
    } else if (valor >= 1e30 && valor < 1e33) {
      return Math.floor(valor / 1e29) / 10 + 'No';
    } else {
      return Math.floor(valor / 1e32) / 10 + 'Dc';
    }
  }
}