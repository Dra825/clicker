import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, ToastController, IonCol, IonRow, IonGrid, ModalController } from '@ionic/angular';
import { ShopComponent } from './shop/shop.component';
import { ZonesComponent } from './zones/zones.component';
import Zonas from '../../assets/data/Zonas.json';
import CrucesOlvidados from '../../assets/data/CrucesOlvidados.json';
import SenderoVerde from '../../assets/data/SenderoVerde.json';
import ParamosFungicos from '../../assets/data/ParamosFungicos.json';
import HogarDeDioses from '../../assets/data/HogarDeDioses.json';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCol, IonRow, IonGrid],
})
export class HomePage implements OnInit, OnDestroy {

  geo: number = 0;
  daño: number = 1;
  cooldown: number = 3.0;
  geoMultiplicador: number = 1;
  ZonasList: any[] = Zonas.Zonas;
  ZonaActual: any = Zonas.Zonas[0];
  ZonaAnterior: any = null;
  enemiesList: any[] = CrucesOlvidados.Enemies;
  automatico: number = 0;
  Enemigo: any = null;
  VidaEnemigo: number = 0;
  VidaMaxima: number = 0;
  enabledItems: any[] = [];
  Ayudantes: any[] = [
    {
      name: 'Quirrel',
      image: 'assets/Clicker/Quirrel.webp'
    }
  ];
  AyudantesEsclavizados: any[] = [];
  enabledZones: string[] = [Zonas.Zonas[0].name];
  tiempoRestante: number = 0;
  TiempoBoss: number = 30;
  BossTerminado: boolean = false;

  private audio = new Audio();
  musicaSonando: boolean = false;
  private autoInterval: any = null;
  private cuentaAtrasInterval: any = null;
  private BossInterval: any = null;
  private respawnTimeout: any = null;
  respawnPendiente: boolean = false;

  constructor(
    private toastController: ToastController,
    private modalCtrl: ModalController,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const saved = localStorage.getItem('clicks');
    if (saved !== null) {
      this.geo = Number(saved);
    } else {
      this.geo = 0;
    }

    const savedDaño = localStorage.getItem('daño');
    if (savedDaño !== null) {
      this.daño = Number(savedDaño);
    }

    const savedMultiplier = localStorage.getItem('geoMultiplicador');
    if (savedMultiplier !== null) {
      this.geoMultiplicador = Number(savedMultiplier);
    }

    const cooldown = localStorage.getItem('cooldown');
    if (cooldown !== null) {
      this.cooldown = Number(cooldown);
    }

    const automatico = localStorage.getItem('automatico');
    if (automatico !== null) {
      this.automatico = Number(automatico);
    }

    const savedEnabled = localStorage.getItem('enabledItems');
    if (savedEnabled !== null) {
      this.enabledItems = JSON.parse(savedEnabled);
    }

    const AyudantesGuardados = localStorage.getItem('AyudantesEsclavizados');
    if (AyudantesGuardados !== null) {
      this.AyudantesEsclavizados = JSON.parse(AyudantesGuardados);
    }

    const savedZones = localStorage.getItem('enabledZones');
    if (savedZones !== null) {
      this.enabledZones = JSON.parse(savedZones);
    }

    const ZonaGuardada = localStorage.getItem('ZonaActual');
    if (ZonaGuardada !== null) {
      this.ZonaActual = JSON.parse(ZonaGuardada);
    }

    const BossGuardado = localStorage.getItem('BossTerminado');
    if (BossGuardado !== null) {
      this.BossTerminado = BossGuardado === 'true';
    }

    this.audio.src = this.ZonaActual.music;
    this.audio.loop = true;
    this.audio.load();
    this.reproducirMusica();
    this.CargarEnemigos();
    this.AtaqueAutomatico();


    const respawn = localStorage.getItem('respawnPendiente');

    if (respawn === 'true') {
      this.iniciarRespawn();
    } else {
      const enemigo = localStorage.getItem('Enemigo');

      if (enemigo !== null) {
        this.Enemigo = JSON.parse(enemigo);
        this.VidaEnemigo = this.Enemigo.health;
        this.VidaMaxima = this.Enemigo.health;
      } else {
        this.EnemigoRandom();
      }
    }
  }

  ngOnDestroy() {
    if (this.autoInterval) {
      clearInterval(this.autoInterval);
    }

    if (this.respawnTimeout) {
      clearTimeout(this.respawnTimeout);
    }

    if (this.cuentaAtrasInterval) {
      clearInterval(this.cuentaAtrasInterval);
    }

    if (this.BossInterval) {
      clearInterval(this.BossInterval);
    }
  }

  reproducirMusica() {
    this.audio.play()
      .then(() => {
        this.musicaSonando = true;
      })
      .catch(error => {
        this.musicaSonando = false;
        console.error('Error al reproducir la música:', error);
      });
  }

  CargarEnemigos() {
    if (this.ZonaActual.name === 'Cruces Olvidados') {
      this.enemiesList = CrucesOlvidados.Enemies;
    }

    if (this.ZonaActual.name === 'Sendero Verde') {
      this.enemiesList = SenderoVerde.Enemies;
    }

    if (this.ZonaActual.name === 'Paramos Fungicos') {
      this.enemiesList = ParamosFungicos.Enemies;
    }

    if (this.ZonaActual.name === 'Hogar de Dioses') {
      this.enemiesList = HogarDeDioses.Enemies;
    }
  }

  EnemigoRandom() {
    if (this.ZonaActual.name === 'Hogar de Dioses' && this.BossTerminado) {
      return;
    }
    const EnemigoRandom = Math.floor(Math.random() * this.enemiesList.length);

    this.Enemigo = this.enemiesList[EnemigoRandom];

    this.VidaEnemigo = this.Enemigo.health;
    this.VidaMaxima = this.Enemigo.health;

    if (this.ZonaActual.name === 'Hogar de Dioses') {
      this.IniciarCombateBoss();
    }
    localStorage.setItem('Enemigo', JSON.stringify(this.Enemigo));
  }

  IniciarCombateBoss() {
    this.TiempoBoss = 30;
    this.BossTerminado = false;
    localStorage.setItem('BossTerminado', 'false');

    if (this.BossInterval) {
      clearInterval(this.BossInterval);
    }

    this.BossInterval = setInterval(() => {
      this.TiempoBoss--;
      if (this.TiempoBoss > 0) {
        this.cdr.detectChanges();
      } else {
        clearInterval(this.BossInterval);
        this.BossInterval = null;

        this.ZonaActual = this.ZonaAnterior;
        localStorage.setItem('ZonaActual', JSON.stringify(this.ZonaActual));

        this.CargarEnemigos();
        this.audio.src = this.ZonaActual.music;
        this.audio.load();
        this.reproducirMusica();

        this.Enemigo = null;
        this.EnemigoRandom();

        this.cdr.detectChanges();
      }
    }, 1000);
  }

  iniciarRespawn() {
    this.respawnPendiente = true;
    this.tiempoRestante = this.cooldown;
    localStorage.setItem('respawnPendiente', 'true');

    if (this.cuentaAtrasInterval) {
      clearInterval(this.cuentaAtrasInterval);
    }
    this.cuentaAtrasInterval = setInterval(() => {
      if (this.tiempoRestante > 0) {
        this.tiempoRestante = Number((this.tiempoRestante - 0.1).toFixed(1));
        this.cdr.detectChanges();
      }
    }, 100);

    this.respawnTimeout = setTimeout(() => {
      this.EnemigoRandom();
      localStorage.removeItem('respawnPendiente');
      this.respawnPendiente = false;

      if (this.cuentaAtrasInterval) {
        clearInterval(this.cuentaAtrasInterval);
      }
      this.tiempoRestante = 0;

      this.cdr.detectChanges();
    }, this.cooldown * 1000);
  }

  derrotarEnemigo() {
    if (this.ZonaActual.name === 'Hogar de Dioses') {
      clearInterval(this.BossInterval);
      this.BossInterval = null;

      this.BossTerminado = true;
      localStorage.setItem('BossTerminado', 'true');
      this.Enemigo = null;
      this.VidaEnemigo = 0;
      this.VidaMaxima = 0;

      localStorage.removeItem('Enemigo');

      this.MostrarMensaje('¡HAS DERROTADO A ABSOLUTE RADIANCE! ¡HAS SALVADO HALLOWNEST!');
      return;
    }

    this.geo += (this.Enemigo.geo * this.geoMultiplicador);

    this.Enemigo = null;
    this.VidaEnemigo = 0;
    this.VidaMaxima = 0;

    localStorage.removeItem('Enemigo');

    this.updateGeo();
    this.iniciarRespawn();
  }

  Atacar() {
    if (!this.musicaSonando) {
      this.reproducirMusica();
    }

    if (this.Enemigo && !this.respawnPendiente) {
      this.VidaEnemigo -= this.daño;
      if (this.VidaEnemigo <= 0) {
        this.derrotarEnemigo();
      }
    }
    this.updateGeo();
  }

  AtaqueAutomatico() {
    if (this.autoInterval) {
      clearInterval(this.autoInterval);
    }
    if (this.automatico > 0) {
      this.autoInterval = setInterval(() => {
        if (this.Enemigo && !this.respawnPendiente) {
          this.VidaEnemigo -= this.automatico;
          if (this.VidaEnemigo <= 0) {
            this.derrotarEnemigo();
          }
        }
        this.cdr.detectChanges();

      }, 1000);
    }
  }

  quitarGeo(geo: number) {
    this.geo -= geo;
    this.updateGeo();
    this.cdr.detectChanges();
  }

  updateGeo() {
    localStorage.setItem('clicks', String(this.geo));
  }

  async openShop() {
    const modal = await this.modalCtrl.create({
      component: ShopComponent,
      componentProps: {
        geoTienda: this.geo,
        enabledItems: this.enabledItems
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'buy' && data) {
      if (this.geo >= data.price) {
        this.quitarGeo(data.price);

        if (data.name === 'X2 Geo') {
          if (this.geoMultiplicador < 2) {
            this.geoMultiplicador = 2;
            localStorage.setItem('geoMultiplicador', String(this.geoMultiplicador));
            this.MostrarMensaje("X2 GEO ACTIVADO!");
          }
        }

        if (data.name === 'X3 Geo') {
          this.geoMultiplicador = 3;
          localStorage.setItem('geoMultiplicador', String(this.geoMultiplicador));
          this.MostrarMensaje("X3 GEO ACTIVADO!");
        }

        if (data.name === '+1 Dmg' || data.name === '+1 Dmg II') {
          this.daño++;
          localStorage.setItem('daño', String(this.daño));
          this.MostrarMensaje("Daño aumentado!");
        }

        if (data.name === '+2 Dmg') {
          this.daño += 2;
          localStorage.setItem('daño', String(this.daño));
          this.MostrarMensaje("+2 Daño!");
        }

        if (data.name === '+3 Dmg') {
          this.daño += 3;
          localStorage.setItem('daño', String(this.daño));
          this.MostrarMensaje("+3 Daño!");
        }

        if (data.name === 'Quirrel') {
          this.automatico++;
          localStorage.setItem('automatico', String(this.automatico));
          this.AtaqueAutomatico();
          this.MostrarMensaje("Quirrel te ayuda!");
        }

        if (data.name === 'Quirrel II') {
          this.automatico += 2;
          localStorage.setItem('automatico', String(this.automatico));
          this.AtaqueAutomatico();
          this.MostrarMensaje("Quirrel se hace mas fuerte!");
        }

        if (data.name === 'Quirrel III') {
          this.automatico += 3;
          localStorage.setItem('automatico', String(this.automatico));
          this.AtaqueAutomatico();
          this.MostrarMensaje("Quirrel esta mamadisimo!");
        }

        if (data.name === 'Quirrel' || data.name === 'Quirrel II' || data.name === 'Quirrel III') {
          if (!this.AyudantesEsclavizados.some(a => a.name === 'Quirrel')) {
            this.AyudantesEsclavizados.push(this.Ayudantes[0]);
            localStorage.setItem('AyudantesEsclavizados', JSON.stringify(this.AyudantesEsclavizados));
          }
        }

        if (data.name === 'Reducir Cooldown') {
          this.cooldown -= 0.5;
          localStorage.setItem('cooldown', String(this.cooldown));
          this.MostrarMensaje(`Cooldown reducido a ${this.cooldown}s`);
        }

        this.enabledItems.push(data.name);
        localStorage.setItem('enabledItems', JSON.stringify(this.enabledItems));
        this.cdr.detectChanges();
      }
    }
  }

  async openZones() {
    const modal = await this.modalCtrl.create({
      component: ZonesComponent
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'zone' && data) {
      if (this.enabledZones.includes(data.name)) {
        if (this.respawnTimeout) {
          clearTimeout(this.respawnTimeout);
          this.respawnTimeout = null;
        }
        if (this.BossInterval) {
          clearInterval(this.BossInterval);
          this.BossInterval = null;
        }
        if (this.cuentaAtrasInterval) {
          clearInterval(this.cuentaAtrasInterval);
          this.cuentaAtrasInterval = null;
        }
        this.respawnPendiente = false;
        this.tiempoRestante = 0;
        localStorage.removeItem('respawnPendiente');
        localStorage.removeItem('Enemigo');
        if (data.name === 'Hogar de Dioses') {
          this.ZonaAnterior = this.ZonaActual;
        }
        this.ZonaActual = data;
        localStorage.setItem('ZonaActual', JSON.stringify(data));
        this.CargarEnemigos();
        this.audio.src = this.ZonaActual.music;
        this.audio.load();
        this.reproducirMusica();
        this.Enemigo = null;
        this.EnemigoRandom();
      } else if (this.geo >= data.price) {
        this.geo -= data.price;
        this.enabledZones.push(data.name);
        this.updateGeo();
        localStorage.setItem('enabledZones', JSON.stringify(this.enabledZones));
        this.MostrarMensaje('ZONA DESBLOQUEADA');
      }
    }
    this.cdr.detectChanges();
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

  async MostrarMensaje(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 1500,
      position: 'top',
    });

    await toast.present();
  }
}