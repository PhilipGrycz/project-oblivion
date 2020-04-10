import Phaser from 'phaser'
import groundData from './../data/grounds_data'
import soulData from './../data/soul_data'
import enemiesData from './../data/enemies_data'
import backgroundImage from './../assets/images/level1/background.png'
import groundImage from './../assets/images/level1/ground.png'
import dryadShotImage from './../assets/images/level1/dryad_shot.png'
import dryadImage from './../assets/images/level1/dryad.png'
import flyingEnemyImage from './../assets/images/level1/flying_enemy.png'
import soulImage from './../assets/images/shared/soul.png'
import hudImage from './../assets/images/shared/hud.png'
import hearthImage from './../assets/images/shared/heart.png'
import bloodSplatImage from './../assets/images/shared/blood_splat.png'
import playerImage from './../assets/images/shared/player.png'
import playerCrouchImage from './../assets/images/shared/player_crouch.png'

export default class Level1Scene extends Phaser.Scene {
  constructor () {
    super({ key: 'Level1Scene' })

    this.player = null
    this.grounds = null
    this.enemies = []
    this.score = 0
    this.scoreText = ''
    this.hudContainer = null
    this.health = 10
    this.hearts = []
    this.bloodSplat = null
    this.soulsCollected = 0
    this.bullets = []
  }

  preload () {
    this.load.image('background', backgroundImage)
    this.load.image('ground', groundImage)
    this.load.image('bullet', dryadShotImage)
    this.load.spritesheet('dryad_enemy', dryadImage, { frameWidth: 27, frameHeight: 43 })
    this.load.spritesheet('flying_enemy', flyingEnemyImage, { frameWidth: 30, frameHeight: 44 })
    this.load.spritesheet('soul', soulImage, { frameWidth: 11, frameHeight: 12 })
    this.load.image('hud', hudImage)
    this.load.image('heart', hearthImage)
    this.load.image('blood_splat', bloodSplatImage)
    this.load.spritesheet('player', playerImage, { frameWidth: 21, frameHeight: 39 })
    this.load.spritesheet('player_crouch', playerCrouchImage, { frameWidth: 21, frameHeight: 20 })
  }

  create () {
    this.add.image(0, 0, 'background').setOrigin(0, 0).setScrollFactor(1)

    this.add.image(260, 173, 'hud').setOrigin(0, 0).setScrollFactor(0).setDisplaySize(165, 20)

    this.cameras.main.setBounds(0, 0, 3560, 1080)

    this.cursors = this.input.keyboard.createCursorKeys()

    this.grounds = this.physics.add.staticGroup()

    this.enemies = this.physics.add.group()

    this.bullets = this.physics.add.group()

    this.souls = this.physics.add.staticGroup()

    this.hearts = this.physics.add.staticGroup()

    this.createPlayer()

    this.createEnemies()

    this.createGrounds()

    this.createSouls()

    this.createHud()

    this.cameras.main.startFollow(this.player, true, 0.09, 0.09)

    this.cameras.main.setZoom(2.37)

    this.bloodSplat = this.physics.add.image(400, 300, 'blood_splat')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setVisible(false)
      .setDisplaySize(10, 10)
      .setGravity(0, -300)
  }

  update () {
    // if player is not visible don't move him
    if (this.player.active === false || this.player.visible === false) {
      return
    }

    if (!this.player.isCrouching && this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-200)
    } else if (this.cursors.down.isDown && this.player.body.touching.down) {
      this.player.isCrouching = true
      this.player.setSize(21, 20)
      this.player.setVelocityX(0)
      this.player.anims.play('crouch_right')
    } else if (!this.player.isCrouching && this.cursors.left.isDown && !this.player.body.touching.left) {
      this.player.setVelocityX(-100)

      if (this.cursors.up.isDown) {
        this.player.anims.play('jump_left')
      } else if (this.player.body.touching.down) {
        this.player.anims.play('left', true)
      }
    } else if (!this.player.isCrouching && this.cursors.right.isDown && !this.player.body.touching.right) {
      this.player.setVelocityX(100)

      if (this.cursors.up.isDown) {
        this.player.anims.play('jump_right')
      } else if (this.player.body.touching.down) {
        this.player.anims.play('right', true)
      }
    } else if (!this.cursors.down.isDown) {
      this.player.setVelocityX(0)
      if (this.player.isCrouching) {
        this.player.setPosition(this.player.x, this.player.y - 10)
        this.player.setSize(21, 39)
        this.player.isCrouching = false
      }
      this.player.anims.play('turn')
    }
  }

  createPlayer () {
    this.player = this.physics.add.sprite(19, 29, 'player')

    this.player.setBounce(0.1)
    this.player.setCollideWorldBounds(false)

    // add collider as property of player so we can access it later
    this.player.collider = this.physics.add.collider(this.player, this.grounds)

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1
    })

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'player', frame: 5 }],
      frameRate: 1
    })

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', { start: 6, end: 9 }),
      frameRate: 5,
      repeat: -1
    })

    this.anims.create({
      key: 'jump_left',
      frames: [{ key: 'player', frame: 10 }],
      frameRate: 1,
      repeat: -1
    })

    this.anims.create({
      key: 'jump_right',
      frames: [{ key: 'player', frame: 11 }],
      frameRate: 1
    })

    this.anims.create({
      key: 'crouch_right',
      frames: [{ key: 'player', frame: 13 }],
      frameRate: 1,
      repeat: -1
    })
  }

  createEnemies () {
    enemiesData.forEach(element => {
      const x = element[0]
      const y = element[1]
      const width = element[2]
      const height = element[3]
      const imageType = element[4]
      const movementType = element[5]
      // create enemy
      const enemy = this.enemies.create(x, y, imageType)
      enemy.setDisplaySize(width, height).setOrigin(0, 0)
      enemy.movementType = movementType

      // animations
      if (imageType === 'flying_enemy') {
        this.anims.create({
          key: 'flying_enemy_left',
          frames: this.anims.generateFrameNumbers('flying_enemy', {
            start: 0,
            end: 1
          }),
          frameRate: 3,
          repeat: -1
        })

        this.anims.create({
          key: 'flying_enemy_right',
          frames: this.anims.generateFrameNumbers('flying_enemy', {
            start: 2,
            end: 3
          }),
          frameRate: 3,
          repeat: -1
        })
      }

      if (imageType === 'dryad_enemy') {
        this.anims.create({
          key: 'dryad_idle_left',
          frames: this.anims.generateFrameNumbers('dryad_enemy', {
            start: 0,
            end: 1
          }),
          frameRate: 4,
          repeat: -1
        })

        this.anims.create({
          key: 'dryad_attack_left',
          frames: this.anims.generateFrameNumbers('dryad_enemy', {
            start: 2,
            end: 4
          }),
          frameRate: 6
        })

        if (movementType === 'stationary_shooter') {
          enemy.anims.play('dryad_idle_left')
          // do things in intervals
          setInterval(() => {
            // play attack animation
            enemy.anims.play('dryad_attack_left')
            // wait for correct animation frame
            setTimeout(() => {
              // create and shoot bullet
              const bullet = this.bullets.create(enemy.x - 8, enemy.y + 3, 'bullet')
              bullet.setVelocityX(-25).setOrigin(0, 0).setGravityY(-298)
              // back to idle animation
              enemy.anims.play('dryad_idle_left')
              // destroy bullet if it is too far/long
              setTimeout(() => {
                if (bullet) {
                  bullet.destroy()
                }
              }, 10000)
            }, 800)
          }, 5000)
        }
      }

      // movement
      if (movementType === 'flyer') {
        enemy.setVelocityX(50)
        enemy.anims.play('flying_enemy_right')
      }

      // assign velocity to enemy object
      enemy.velocityX = enemy.body.velocity.x
    })
    this.physics.add.collider(this.enemies, this.grounds, this.groundsTouchEventHandler, null, this)
    this.physics.add.collider(this.player, this.enemies, this.enemyTouchEventHandler, null, this)
    this.physics.add.collider(this.player, this.bullets, this.bulletTouchEventHandler, null, this)
    this.physics.add.collider(this.grounds, this.bullets, this.bulletTouchGroundEventHandler, null, this)
  }

  groundsTouchEventHandler (enemy, ground) {
    if (enemy.movementType === 'flyer') {
      if (enemy.body.touching.left && ground.body.touching.right) {
        enemy.setVelocityX(50)
        enemy.anims.play('flying_enemy_right')
      } else if (enemy.body.touching.right && ground.body.touching.left) {
        enemy.setVelocityX(-50)
        enemy.anims.play('flying_enemy_left')
      }
    }

    if (enemy.movementType === 'stationary_shooter') {
      // nothing
    }
    // assign velocity to enemy object because it may have changed
    enemy.velocityX = enemy.body.velocity.x
  }

  enemyTouchEventHandler (player, enemy) {
    // enemy.disableBody(true, true);
    if (player.body.touching.left) {
      player.setPosition(player.x + 20, player.y - 5)
    } else if (player.body.touching.right) {
      player.setPosition(player.x - 20, player.y - 5)
    } else if (player.body.touching.down) {
      player.setPosition(player.x, player.y - 20)
    }
    const velocityX = enemy.velocityX
    console.log(velocityX)
    setTimeout(() => {
      enemy.setVelocityX(velocityX)
    }, 300)

    this.takeDamage(1)
  }

  bulletTouchEventHandler (player, bullet) {
    bullet.destroy()

    this.takeDamage(1)
  }

  bulletTouchGroundEventHandler (player, bullet) {
    bullet.destroy()
  }

  createGrounds () {
    // for(index = 0; index < groundData.length; index++) {

    //   ground1 = grounds.create(groundData[index][0],groundData[index][1],"ground");
    //   ground1.setDisplaySize(groundData[index][2], groundData[index][3]);
    //   ground1.setOrigin(0, 0);
    //   ground1.refreshBody();
    // }
    groundData.forEach(element => {
      this.grounds.create(element[0], element[1], 'ground')
        .setDisplaySize(element[2], element[3])
        .setOrigin(0, 0)
        .refreshBody()
    })
  }

  createSouls () {
    this.anims.create({
      key: 'soul_idle',
      frames: this.anims.generateFrameNumbers('soul', { start: 0, end: 1 }),
      frameRate: 3,
      repeat: -1
    })

    soulData.forEach(element => {
      const soul = this.souls.create(element[0], element[1], 'soul')
        .setDisplaySize(element[2], element[3])
        .setOrigin(0, 0)
        .refreshBody()
      soul.anims.play('soul_idle')
    })

    this.physics.add.overlap(this.souls, this.player, this.collectSoul, null, this)
  }

  collectSoul (player, soul) {
    soul.destroy()
    this.soulsCollected++
    this.updateHud()
  }

  takeDamage (damageValue = 1) {
    this.health -= damageValue
    if (this.health === 0) {
      this.makePlayerDie()
      return
    }
    // make camera flash red
    this.cameras.main.flash(250, 100, 0, 0)
    // and make camera shake?
    // this.cameras.main.shake();

    this.updateHud()
    // health = health - damageValue;
  }

  makePlayerDie () {
    // remove update and colliders from player and hide him
    this.player.collider.active = false
    this.player.active = false
    this.player.setVisible(false)

    this.bloodSplat.setVisible(true)
    // call the blood resize tween now
    this.tweens.add({
      targets: this.bloodSplat,
      scaleX: 5,
      scaleY: 5,
      x: -this.bloodSplat.width,
      y: -(this.bloodSplat.height + 50),
      delay: 0,
      duration: 1000
    })
    // call the blood fall down tween now but have it wait 0.8s
    this.tweens.add({
      targets: this.bloodSplat,
      alpha: 0,
      y: 1000,
      delay: 500,
      duration: 2000
    })
    // fade camera
    this.cameras.main.fade()
    setTimeout(() => {
      this.bloodSplat.destroy()
      // show menu scene
      this.showMenuScene()
    }, 2000)
  }

  showMenuScene () {
    this.scene.start('Menu')
  }

  createHud () {
    this.scoreText = this.add.text(330, 182, 'SCORE:0', { fontFamily: 'Roboto', fontSize: '10px', fill: '#aaa' })
    this.scoreText.setOrigin(0, 0).setScrollFactor(0)

    for (let index = 1; index <= 10; index++) {
      this.hearts.create(273 + (index * 8.7), 174, 'heart')
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDisplaySize(9, 8)
        .refreshBody()
    }

    this.soulsCollectedText = this.add.text(282, 182, 'SOULS:0', {
      fontFamily: 'Roboto',
      fontSize: '9px',
      fill: '#aaa'
    })
    this.soulsCollectedText.setOrigin(0, 0).setScrollFactor(0)
  }

  updateHud () {
    const heartsGroupChildren = this.hearts.getChildren()

    heartsGroupChildren.forEach(function (heart) {
      heart.setVisible(false)
    })

    for (let index = 0; index < this.health; index++) {
      heartsGroupChildren[index].setVisible(true)
    }

    // souls
    this.soulsCollectedText.setText('SOULS:' + this.soulsCollected)
  }
}
