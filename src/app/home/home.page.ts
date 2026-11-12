import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, ToastController, IonCol, IonRow, IonGrid, ModalController } from '@ionic/angular';
import { ShopComponent } from './shop/shop.component';
import { ZonesComponent } from './zones/zones.component';
import Zonas from '../../assets/data/Zonas.json';
import CrucesOlvidados from '../../assets/data/CrucesOlvidados.json';
import SenderoVerde from '../../assets/data/SenderoVerde.json';
import ParamosFungicos from '../../assets/data/ParamosFungicos.json';
import CumbreDeCristal from '../../assets/data/CumbreDeCristal.json';
import HogarDeDioses from '../../assets/data/HogarDeDioses.json';
import CanonNublado from '../../assets/data/CanonNublado.json';
import CiudadDeLagrimas from '../../assets/data/CiudadDeLagrimas.json';
import CanalesReales from '../../assets/data/CanalesReales.json';
import TierrasDeReposo from '../../assets/data/TierrasDeReposo.json';
import AcantiladosAulladores from '../../assets/data/AcantiladosAulladores.json';
import CuencaAntigua from '../../assets/data/CuencaAntigua.json';
import NidoProfundo from '../../assets/data/NidoProfundo.json';
import LaColmena from '../../assets/data/LaColmena.json';
import LimiteDelReino from '../../assets/data/LimiteDelReino.json';
import ColiseoDeLosInsensatos from '../../assets/data/ColiseoDeLosInsensatos.json';
import JardinesDeLaReina from '../../assets/data/JardinesDeLaReina.json';
import ElAbismo from '../../assets/data/ElAbismo.json';
import PalacioBlanco from '../../assets/data/PalacioBlanco.json';



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCol, IonRow, IonGrid],
})
export class HomePage implements OnInit, OnDestroy {

  geo: number = 0;
  Dano: number = 1;
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
    },
    {
      name: 'Hornet',
      image: 'assets/Clicker/Hornet.png'
    },
    {
      name: 'SirvienteReal',
      image: 'assets/Clicker/PalacioBlanco/Royal_Retainer.png'
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

    const savedDano = localStorage.getItem('Dano');
    if (savedDano !== null) {
      this.Dano = Number(savedDano);
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
    if (this.ZonaActual.name === 'Hogar de Dioses' && !this.BossTerminado) {
      this.IniciarCombateBoss();
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

  CancionSecreta() {
    if (this.ZonaActual.name === 'Ciudad de Lágrimas') {
      this.MostrarMensaje('Aqui no, que es mi zona favorita y la musica es peak');
      return;
    }

    this.audio.src = 'assets/Clicker/CancionSecreta.mp3';
    this.audio.load();
    this.reproducirMusica();
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

    if (this.ZonaActual.name === 'Cumbre de Cristal') {
      this.enemiesList = CumbreDeCristal.Enemies;
    }

    if (this.ZonaActual.name === 'Hogar de Dioses') {
      this.enemiesList = HogarDeDioses.Enemies;
    }

    if (this.ZonaActual.name === 'Cañón Nublado') {
      this.enemiesList = CanonNublado.Enemies;
    }

    if (this.ZonaActual.name === 'Ciudad de Lágrimas') {
      this.enemiesList = CiudadDeLagrimas.Enemies;
    }

    if (this.ZonaActual.name === 'Canales Reales') {
      this.enemiesList = CanalesReales.Enemies;
    }

    if (this.ZonaActual.name === 'Tierras de Reposo') {
      this.enemiesList = TierrasDeReposo.Enemies;
    }

    if (this.ZonaActual.name === 'Acantilados Aulladores') {
      this.enemiesList = AcantiladosAulladores.Enemies;
    }

    if (this.ZonaActual.name === 'Cuenca Antigua') {
      this.enemiesList = CuencaAntigua.Enemies;
    }

    if (this.ZonaActual.name === 'Nido Profundo') {
      this.enemiesList = NidoProfundo.Enemies;
    }

    if (this.ZonaActual.name === 'La Colmena') {
      this.enemiesList = LaColmena.Enemies;
    }

    if (this.ZonaActual.name === 'Límite del Reino') {
      this.enemiesList = LimiteDelReino.Enemies;
    }

    if (this.ZonaActual.name === 'Coliseo de los Insensatos') {
      this.enemiesList = ColiseoDeLosInsensatos.Enemies;
    }

    if (this.ZonaActual.name === 'Jardines de la Reina') {
      this.enemiesList = JardinesDeLaReina.Enemies;
    }

    if (this.ZonaActual.name === 'El Abismo') {
      this.enemiesList = ElAbismo.Enemies;
    }

    if (this.ZonaActual.name === 'Palacio Blanco') {
      this.enemiesList = PalacioBlanco.Enemies;
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
    if (this.enabledItems.includes('Bendición del Rey Pálido')) {
      this.TiempoBoss = 45;
    } else {
      this.TiempoBoss = 30;
    }
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

        this.ZonaActual = this.ZonaAnterior ?? this.ZonasList[0];
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
      this.VidaEnemigo -= this.Dano;
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

  async openShop(vendedor: string) {
    localStorage.setItem('vendedorTienda', vendedor);
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
          this.Dano++;
          localStorage.setItem('Dano', String(this.Dano));
          this.MostrarMensaje("Dano aumentado!");
        }

        if (data.name === '+2 Dmg') {
          this.Dano += 2;
          localStorage.setItem('Dano', String(this.Dano));
          this.MostrarMensaje("+2 Dano!");
        }

        if (data.name === '+3 Dmg') {
          this.Dano += 3;
          localStorage.setItem('Dano', String(this.Dano));
          this.MostrarMensaje("+3 Dano!");
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
          this.MostrarMensaje("Quirrel te ayuda!");
        }

        if (data.name === 'Quirrel III') {
          this.automatico += 3;
          localStorage.setItem('automatico', String(this.automatico));
          this.AtaqueAutomatico();
          this.MostrarMensaje("Quirrel te ayuda!");
        }

        if (data.name === 'Hornet') {
          this.automatico += 6;
          localStorage.setItem('automatico', String(this.automatico));
          this.AtaqueAutomatico();
          this.MostrarMensaje("Hornet te ayuda!");
        }

        if (data.name === 'Hornet II') {
          this.automatico += 4;
          localStorage.setItem('automatico', String(this.automatico));
          this.AtaqueAutomatico();
          this.MostrarMensaje("Hornet te ayuda!");
        }

        if (data.name === 'Hornet III') {
          this.automatico += 6;
          localStorage.setItem('automatico', String(this.automatico));
          this.AtaqueAutomatico();
          this.MostrarMensaje("Hornet te ayuda!");
        }

        if (data.name === 'Hornet' || data.name === 'Hornet II' || data.name === 'Hornet III') {
          if (!this.AyudantesEsclavizados.some(a => a.name === 'Hornet')) {
            this.AyudantesEsclavizados.push(this.Ayudantes[1]);
            localStorage.setItem('AyudantesEsclavizados', JSON.stringify(this.AyudantesEsclavizados));
          }
        }

        if (data.name === 'Quirrel' || data.name === 'Quirrel II' || data.name === 'Quirrel III') {
          if (!this.AyudantesEsclavizados.some(a => a.name === 'Quirrel')) {
            this.AyudantesEsclavizados.push(this.Ayudantes[0]);
            localStorage.setItem('AyudantesEsclavizados', JSON.stringify(this.AyudantesEsclavizados));
          }
        }

        if (data.name === 'Sirviente Real') {
          this.AyudantesEsclavizados.push(this.Ayudantes[2]);
          localStorage.setItem('AyudantesEsclavizados', JSON.stringify(this.AyudantesEsclavizados));
        }

        if (data.name === 'Reducir Cooldown') {
          this.cooldown -= 0.5;
          localStorage.setItem('cooldown', String(this.cooldown));
          this.MostrarMensaje(`Cooldown reducido a ${this.cooldown}s`);
        }

        if (data.name === 'Puntada veloz') {
          this.Dano += 4;
          localStorage.setItem('Dano', String(this.Dano));
          this.MostrarMensaje('¡Puntada veloz! +4 de daño');
        }

        if (data.name === 'Capa de lluvia') {
          this.cooldown -= 0.5;
          localStorage.setItem('cooldown', String(this.cooldown));
          this.MostrarMensaje(`Cooldown reducido a ${this.cooldown}s`);
        }

        if (data.name === 'Capa impermeable') {
          this.cooldown -= 0.5;
          localStorage.setItem('cooldown', String(this.cooldown));
          this.MostrarMensaje(`Cooldown reducido a ${this.cooldown}s`);
        }

        if (data.name === 'Aguijón puro') {
          this.Dano += 25;
          localStorage.setItem('Dano', String(this.Dano));
          this.MostrarMensaje('+25 de daño, que aura');
        }

        if (data.name === 'Sirviente Real') {
          this.automatico += 25;
          localStorage.setItem('automatico', String(this.automatico));
          this.AtaqueAutomatico();
          this.MostrarMensaje("Sirviente Real viene a cargarse a TODOS!");
        }

        this.enabledItems.push(data.name);
        localStorage.setItem('enabledItems', JSON.stringify(this.enabledItems));
        this.cdr.detectChanges();
        await this.openShop(vendedor);
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
        await this.openZones();
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