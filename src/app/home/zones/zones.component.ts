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
}