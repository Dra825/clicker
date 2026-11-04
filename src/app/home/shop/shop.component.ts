import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, ToastController, IonCol, IonRow, IonGrid, ModalController, IonIcon} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { headset } from 'ionicons/icons';
import Items from '../../../assets/data/items.json';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCol, IonRow, IonGrid, IonIcon],
})
export class ShopComponent implements OnInit {

  contadorTienda: number = 0; 
  public items: any = [];
  public enabledItems: any[] = [];

  constructor(private modalCtrl: ModalController) { 
    addIcons({ headset });
  }

  ngOnInit() {  
    const saved = localStorage.getItem('clicks'); 
    if (saved !== null) {
      this.contadorTienda = Number(saved);
    } else {
      this.contadorTienda = 0;
    }

    const savedEnabled = localStorage.getItem('enabledItems');
    if (savedEnabled !== null) {
    this.enabledItems = JSON.parse(savedEnabled);
    }

    this.items = Items.items;
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

  buyItem(item: any) {
    return this.modalCtrl.dismiss(item, 'buy');
  }
}