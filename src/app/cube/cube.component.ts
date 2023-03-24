import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as Phaser from 'phaser';



@Component({
  selector: 'app-cube',
  templateUrl: './cube.component.html',
  styleUrls: ['./cube.component.less']
})


export class CubeComponent implements OnInit, AfterViewInit {

  phaserGame: Phaser.Game;
  config: Phaser.Types.Core.GameConfig;
  constructor() {
    this.config = {
      type: Phaser.AUTO,
      height: window.innerHeight,
      width: window.innerWidth,
      backgroundColor: '#2d2d2d',
      scene: [MainScene],
      parent: 'gameContainer',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      }
    };
    this.phaserGame = new Phaser.Game(this.config);
  }

  ngOnInit(): void {


  }

  ngAfterViewInit() {
  }


}


class MainScene extends Phaser.Scene {

  cursors: any;
  spaceShip: any;
  protect: any;
  enemy: any;
  enemies: any;
  bonus: any;
  stars: any;
  particules: any;

  score = 0;
  scoreText: any;
  isProtected = false;
  loose = false;

  start = false;

  enemiesType = [{ name: 'enemy', sizeRatio: 1 }, { name: 'enemy2', sizeRatio: 0.1 }, { name: 'enemy3', sizeRatio: 1 }]

  maxEnnemies = 10;
  deadEnnemies = 0;
  deadEnnemiesText: any;

  destroyAnimPlayed = false;

  constructor() {
    super({ key: 'main' });
  }
  create() {

    this.createStartPage();

  }

  createStartPage() {
    // Ajouter les éléments de la page d'accueil, tels que le titre, les boutons de démarrage et les instructions
    // Par exemple :
    this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 3, 'Asteroids', { fontSize: '48px' }).setOrigin(0.5);
    this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 50, 'Le clic permet de se protéger', {
      fontSize: '18px',
      color: '#ffff00',
      padding: {
        x: 10,
        y: 10
      },
      align: 'center',
      maxLines: 2
    }).setOrigin(0.5);
    let startButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 100, 'Démarrer', { fontSize: '24px' }).setOrigin(0.5);
    startButton.setInteractive();
    startButton.on('pointerover', () => {
      startButton.setFill('#ffff00'); // Changer la couleur du texte en jaune lorsque le joueur passe en hover
    });

    startButton.on('pointerout', () => {
      startButton.setFill('#ffffff'); // Revenir à la couleur d'origine lorsque le joueur quitte le bouton
    });
    if (!this.start) { }
    startButton.on('pointerdown', () => {
      // Lorsque le bouton est cliqué, commencer la partie
      if (!this.start) {
        this.startGame();
      }
    });
  }

  startGame() {
    // Supprimer la page d'accueil et démarrer le jeu
    this.scene.remove('StartPage');
    // Appeler les fonctions qui initialisent votre jeu
    this.init();
    this.createBackground();
    this.createPlayer();
    this.createEnemy();
    this.createUI();
    this.initAnimations();
    this.start = true;
  }

  preload() {
    // player
    this.load.image('spaceShip', '../assets/spaceShip.png');
    // enemies
    this.load.image('enemy', '../assets/asteroid.png');
    this.load.image('enemy2', '../assets/asteroid2.png');
    this.load.image('enemy3', '../assets/asteroid3.png');
    //background
    this.load.image('stars', '../assets/space.png');
    // shield aura
    this.load.image('shield', '../assets/shield.png');
    // bonus
    this.load.image('planet', '../assets/planet1.png');


    // explosion sprite
    this.load.spritesheet("explosionSprite", "../assets/explosion_sprite.png", {
      frameWidth: 192.5,
      frameHeight: 190
    });
    // particles player
    this.load.atlas('flares', 'assets/flares.png', 'assets/flares.json');
    // sounds
    this.load.audio('explo', 'assets/explo.wav');
    this.load.audio('blast', 'assets/blast.mp3');

  }
  override update() {
    // rotate rround
    //Phaser.Actions.RotateAroundDistance(this.particules, { x: this.spaceShip.x, y: this.spaceShip.y }, 0.1, 500);

    //this.physics.collide(this.cube, this.cube2, null, null, this);

    if (this.start) {
      this.updateProtect()

      if (this.enemies.children.entries.length < this.maxEnnemies && !this.loose) {
        this.createEnemy();
      }

      this.updateUi()

      this.entitiesRotate();
    }
  }

  // collision with enemy
  collision(_player: any, _enemy: any) {
    return () => {
      if (_player.body.touching && this.isProtected === true) {
        let exploAnim = this.add.sprite(_enemy.x, _enemy.y, "explosionSprite");
        exploAnim.setScale(0.3);
        exploAnim.play("explosionAnim");
        exploAnim.on('animationcomplete', () => { exploAnim.destroy(true) });


        this.sound.play('explo', { volume: 0.03 });
        _enemy.destroy(true)
        this.deadEnnemies++;
        if (this.deadEnnemies > 20) {
          this.maxEnnemies = 15;
        }
        this.createEnemy();
      } else {
        this.gameOver()
      }
    }
  }

  // collision with bonus entity
  private getBonus(_player: any, _bonus: any) {
    return () => {
      if (_player.body.touching && this.isProtected === true) {
        let exploAnim = this.add.sprite(_bonus.x, _bonus.y, "explosionSprite");
        exploAnim.setScale(0.3);
        exploAnim.play("explosionAnim");
        exploAnim.on('animationcomplete', () => { exploAnim.destroy(true) });
        this.sound.play('explo', { volume: 0.03 });
        _bonus.destroy(true)
      } else {
        this.score += 1000;
        this.updateUi();
        _bonus.destroy(true)
      }
    }
  }

  private createEnemy() {
    // let enemyType = this.enemiesType[this.randomIntFromInterval(0, this.enemiesType.length - 1)];
    // let enemy = this.physics.add.image(this.randomIntFromInterval(0, 800 * 2), 0, enemyType.name).setOrigin(0.5, 0.5);
    // this.physics.moveToObject(enemy, this.spaceShip, this.randomIntFromInterval(100, 300));
    // enemy.setScale((Math.random() + 0.3) * enemyType.sizeRatio);
    let enemyType = this.enemiesType[this.randomIntFromInterval(0, this.enemiesType.length - 1)];
    let enemyWidth = window.innerWidth / 25;
    let enemyHeight = window.innerHeight / 25;
    let enemy = this.physics.add.image(this.randomIntFromInterval(0, window.innerWidth * 2), 0, enemyType.name).setOrigin(0.5, 0.5).setDisplaySize(enemyWidth, enemyHeight);
    this.physics.moveToObject(enemy, this.spaceShip, this.randomIntFromInterval(window.innerHeight / 25, 300));
    enemy.setBounce(1, 1);
    enemy.rotation += this.randomIntFromInterval(0, 360);

    this.physics.add.collider(
      this.spaceShip,
      enemy,
      this.collision(this.spaceShip, enemy));


    enemy.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.spaceShip, enemy);
    this.physics.add.collider(this.enemies, enemy);

    this.enemies.add(enemy)
  }

  private createBonus() {
    let bonus = this.physics.add.image(this.randomIntFromInterval(0, 800 * 2), 0, 'planet').setOrigin(0.5, 0.5);
    this.physics.moveToObject(bonus, this.spaceShip, this.randomIntFromInterval(100, 300));
    bonus.setScale((0.1));
    bonus.setBounce(1, 1);
    bonus.rotation += this.randomIntFromInterval(0, 360);

    this.physics.add.collider(
      this.spaceShip,
      bonus,
      this.getBonus(this.spaceShip, bonus));


    bonus.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.spaceShip, bonus);
    this.physics.add.collider(this.enemies, bonus);
    this.bonus.add(bonus)

  }

  private randomIntFromInterval(min: any, max: any) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  // animate entities rotation
  private entitiesRotate() {
    this.enemies.children.entries.forEach((element: any, index: any) => {
      if (index % 2 === 0) {
        element.rotation += 0.005;
      } else {
        element.rotation -= 0.007;
      }
    });

    this.bonus.children.entries.forEach((element: any, index: any) => {
      if (index % 2 === 0) {
        element.rotation += 0.05;
      } else {
        element.rotation -= 0.07;
      }
    });
  }

  // update UI text
  private updateUi() {
    this.deadEnnemiesText.setText(`Asteroides détruits : ${this.deadEnnemies.toString()}`);
    this.scoreText.setText(this.score.toString());
  }

  // prepare game to restart + show game over text
  private gameOver() {
    if (!this.destroyAnimPlayed) {
      this.destroyAnimPlayed = true;
      let exploAnim = this.add.sprite(this.spaceShip.x, this.spaceShip.y, "explosionSprite").play("explosionAnim");
      exploAnim.on('animationcomplete', () => { exploAnim.destroy(true) });
    }
    this.spaceShip.destroy();
    this.sound.play('blast', { volume: 0.03 });
    this.destroyEntities();
    this.loose = true;


    var style = { font: "bold 50px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
    const gameOver = this.add.text(screenCenterX, screenCenterY, 'GAME OVER', style).setOrigin(0.5);
    gameOver.setShadow(-5, 5, 'rgba(0,0,0,0.5)', 0);

    this.cameras.main.on('camerafadeoutcomplete', () => {
      this.start = false;
      this.scene.restart();

    }, this);

    //  Every time you click, fade the camera
    this.input.once('pointerdown', () => {

      //  Get a random color
      var red = Phaser.Math.Between(50, 255);
      var green = Phaser.Math.Between(50, 255);
      var blue = Phaser.Math.Between(50, 255);

      this.cameras.main.fade(2000, red, green, blue);

    }, this);
  }

  // Destroy all entities, bonus + enemies
  private destroyEntities() {
    this.enemies.children.entries.forEach((element: any) => {
      element.destroy(true);
    });
    this.bonus.children.entries.forEach((element: any) => {
      element.destroy(true);
    });
  }

  private createPlayer() {
    const scaleFactor = Math.min(window.innerWidth / 800, window.innerHeight / 600);

    // spaceShip
    this.spaceShip = this.physics.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'spaceShip').setOrigin(0.5, 0.5);
    this.spaceShip.setScale(scaleFactor / 2);
    this.spaceShip.body.collideWorldBounds = true;
    this.spaceShip.enableBody = true;
    this.spaceShip.body.immovable = true;
    this.spaceShip.body.collideWorldBounds = true;
    this.spaceShip.setCircle(this.spaceShip.body.halfWidth * 2, this.spaceShip.body.halfWidth - this.spaceShip.body.halfHeight * 2, this.spaceShip.body.halfHeight - this.spaceShip.body.halfWidth * 2)

    // protect
    const protectSize = Math.min(window.innerWidth, window.innerHeight) * 0.15;
    const maxProtectSize = 300;
    const protectScaleFactor = Math.min(protectSize / maxProtectSize, 1);
    this.protect = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'shield');
    this.protect.alpha = 0.5;
    this.protect.setScale(protectScaleFactor / 2);

    // particles
    this.particules = this.add.particles('flares');
    this.particules.createEmitter({
      frame: 'red',
      x: this.spaceShip.x,
      y: this.spaceShip.y + 50 / 2,
      lifespan: 100,
      speed: { min: 100, max: 600 },
      angle: 90,
      gravityY: 300,
      scale: { start: 0.4, end: 0 },
      quantity: 1,
      blendMode: 'ADD',
      visible: true
    });
    this.particules.emitters.list[0].on = false;
  }

  private createBackground() {
    this.stars = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'stars');
    this.stars.displayWidth = window.innerWidth * 3;
    this.stars.displayHeight = window.innerHeight * 3;
    this.stars.fixedToCamera = true;
  }

  // check if mouse is pressed
  private updateProtect() {
    const pointer = this.input.activePointer;
    if (pointer.isDown && !this.loose) {
      this.particules.emitters.list[0].on = true;
      this.protect.alpha = 1;
      this.isProtected = true;
      this.stars.angle += 0.10;
    } else {
      this.stars.angle += 0.05;
      this.protect.alpha = 0.5;
      this.isProtected = false;
      if (!this.loose) {
        this.score++;
        if (this.score % 10 === 0 && this.bonus.children.entries.length === 0) {
          this.createBonus();
        }
      }
      this.particules.emitters.list[0].on = false;
      if (this.loose) {
        this.protect.alpha = 0;
        this.destroyEntities();
      }
    }
  }

  private createUI() {
    this.input.mouse.disableContextMenu();

    const style = { font: "bold 25px Arial", fill: "#fff", boundsAlignH: "center" };
    this.scoreText = this.add.text(this.cameras.main.width - 50, 50, this.score.toString(), style).setOrigin(0.5);
    this.scoreText.depth = 12;
    const style2 = { font: "bold 15px Arial", fill: "#fff", boundsAlignH: "center" };
    this.deadEnnemiesText = this.add.text(100, 50, `Asteroides détruits : ${this.deadEnnemies.toString()}`, style2).setOrigin(0.5);
    this.deadEnnemiesText.depth = 12;
  }

  // init score, groups, cursor
  private init() {
    this.enemies = this.add.group();
    this.bonus = this.add.group();
    this.deadEnnemies = 0;
    this.score = 0;
    this.destroyAnimPlayed = false;

    this.loose = false;
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  // init all animations
  private initAnimations() {
    var config = {
      key: "explosionAnim",
      frames: this.anims.generateFrameNumbers("explosionSprite", {
        start: 0,
        end: 21,
        first: 0
      }),
      frameRate: 15,
      repeat: 0,
    };

    this.anims.create(config);
  }
}
