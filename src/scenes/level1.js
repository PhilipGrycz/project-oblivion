import Phaser from 'phaser'
import groundData from './../data/grounds_data'
import soulData from './../data/soul_data'
import enemiesData from './../data/enemies_data'
import backgroundImage from './../assets/images/level1/background.png'
import groundImage from './../assets/images/level1/ground.png'
import dryadShotImage from './../assets/images/level1/dryad_shot.png'
import dryadImage from './../assets/images/level1/dryad.png'
import dryadDeath from './../assets/images/level1/dryad_death.png'
import flyingEnemyImage from './../assets/images/level1/flying_enemy.png'
import flyingEnemyDeathImage from './../assets/images/level1/flying_enemy_death.png'
import biglegsEnemyIdleImage from './../assets/images/level1/biglegs_enemy_idle.png'
import biglegsEnemyFlyImage from './../assets/images/level1/biglegs_enemy_fly.png'
import biglegsEnemyJumpImage from './../assets/images/level1/biglegs_enemy_jump.png'
import biglegsEnemyDeathImage from './../assets/images/level1/biglegs_death.png'
import soulImage from './../assets/images/shared/soul.png'
import hudImage from './../assets/images/shared/hud.png'
import hearthImage from './../assets/images/shared/heart.png'
import bloodSplatImage from './../assets/images/shared/blood_splat.png'
import playerImage from './../assets/images/shared/player.png'
import playerCrouchImage from './../assets/images/shared/player_crouch.png'
import playerAttackImage from './../assets/images/shared/player_attack.png'
import forestSoundtrack from './../assets/audio/level1/forestOST.mp3'
import collectSoul from './../assets/audio/level1/soulCollected.mp3'
import playerHurtSound from './../assets/audio/level1/Hurt.mp3'
import playerDeadSound from './../assets/audio/level1/Death.mp3'
import dryadShotSound from './../assets/audio/level1/Fireball.mp3'
import easterEgg from './../assets/audio/level1/easterEgg.mp3'

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
    this.load.spritesheet('dryad_enemy_death', dryadDeath, { frameWidth: 27, frameHeight: 43 })
    this.load.spritesheet('flying_enemy', flyingEnemyImage, { frameWidth: 30, frameHeight: 44 })
    this.load.spritesheet('flying_enemy_death', flyingEnemyDeathImage, { frameWidth: 26, frameHeight: 42 })
    this.load.spritesheet('biglegs_enemy_idle', biglegsEnemyIdleImage, { frameWidth: 65, frameHeight: 42 })
    this.load.spritesheet('biglegs_enemy_fly', biglegsEnemyFlyImage, { frameWidth: 80, frameHeight: 26 })
    this.load.spritesheet('biglegs_enemy_jump', biglegsEnemyJumpImage, { frameWidth: 60, frameHeight: 60 })
    this.load.spritesheet('biglegs_enemy_death', biglegsEnemyDeathImage, { frameWidth: 90, frameHeight: 33 })
    this.load.spritesheet('soul', soulImage, { frameWidth: 11, frameHeight: 12 })
    this.load.image('hud', hudImage)
    this.load.image('heart', hearthImage)
    this.load.image('blood_splat', bloodSplatImage)
    this.load.spritesheet('player', playerImage, { frameWidth: 21, frameHeight: 39 })
    this.load.spritesheet('player_crouch', playerCrouchImage, { frameWidth: 21, frameHeight: 20 })
    this.load.spritesheet('player_attack', playerAttackImage, { frameWidth: 121, frameHeight: 39 })
    this.load.audio('forest_soundtrack', forestSoundtrack)
    this.load.audio('collect_soul_sound', collectSoul)
    this.load.audio('player_hurt', playerHurtSound)
    this.load.audio('player_dead', playerDeadSound)
    this.load.audio('dryad_shot_sound', dryadShotSound)
    this.load.audio('easter_egg', easterEgg)
  }

  create () {
    this.difficulty = window.game.difficulty

    this.add.image(0, 0, 'background').setOrigin(0, 0).setScrollFactor(1)

    this.add.image(260, 173, 'hud').setOrigin(0, 0).setScrollFactor(0).setDisplaySize(165, 20)

    this.cameras.main.setBounds(0, 0, 3560, 1080)

    this.cursors = this.input.keyboard.createCursorKeys()

    this.attackKey = this.input.keyboard.addKey('X')

    this.grounds = this.physics.add.staticGroup()

    this.enemies = this.add.group()

    this.bullets = this.physics.add.group()

    this.souls = this.physics.add.staticGroup()

    this.hearts = this.physics.add.staticGroup()

    this.createPlayer()

    this.createEnemies()

    this.createGrounds()

    this.createSouls()

    this.createHud()

    this.setupSound()

    this.forestOST.play()

    this.cameras.main.startFollow(this.player, true, 0.09, 0.09)

    this.cameras.main.setZoom(2.37)

    this.easterEgg()

    this.bloodSplat = this.physics.add.image(400, 300, 'blood_splat')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setVisible(false)
      .setDisplaySize(10, 10)
      .setGravity(0, -300)
  }

  update () {
    // if player is not visible don't move him
    if (this.player.isAttacking || this.player.active === false || this.player.visible === false) {
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
      this.player.facingDirection = 'left'
      if (this.cursors.up.isDown) {
        this.player.anims.play('jump_left')
      } else if (this.player.body.touching.down) {
        this.player.anims.play('left', true)
      }
    } else if (!this.player.isCrouching && this.cursors.right.isDown && !this.player.body.touching.right) {
      this.player.setVelocityX(100)
      this.player.facingDirection = 'right'
      if (this.cursors.up.isDown) {
        this.player.anims.play('jump_right')
      } else if (this.player.body.touching.down) {
        this.player.anims.play('right', true)
      }
    } else if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      this.playerAttack()
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
    this.player.facingDirection = 'right'
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

    this.anims.create({
      key: 'player_attack_right',
      frames: this.anims.generateFrameNumbers('player_attack', {
        start: 0,
        end: 3
      }),
      frameRate: 10
    })

    this.anims.create({
      key: 'player_attack_left',
      frames: this.anims.generateFrameNumbers('player_attack', {
        start: 4,
        end: 7
      }),
      frameRate: 4
    })

    // PLAYER ATTACK:
    // enemy has health property enemy.health
    // on button press play atack animation
    // add new invisible box, add colider to the box between enemies and the box
    // destroy the colider (if still exists) in 1 second
    // on colider touch event destroy the box and take live from enemy.
  }

  createEnemies () {
    const self = this
    // animations
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

    this.anims.create({
      key: 'flying_enemy_death',
      frames: this.anims.generateFrameNumbers('flying_enemy_death', {
        start: 0,
        end: 5
      }),
      frameRate: 3
    })

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

    this.anims.create({
      key: 'dryad_enemy_death',
      frames: this.anims.generateFrameNumbers('dryad_enemy_death', {
        start: 0,
        end: 5
      }),
      frameRate: 6
    })

    this.anims.create({
      key: 'biglegs_enemy_idle',
      frames: this.anims.generateFrameNumbers('biglegs_enemy_idle', {
        start: 0,
        end: 1
      }),
      frameRate: 5,
      repeat: -1
    })

    this.anims.create({
      key: 'biglegs_enemy_fly',
      frames: this.anims.generateFrameNumbers('biglegs_enemy_fly', {
        start: 0,
        end: 0
      }),
      frameRate: 6
    })

    this.anims.create({
      key: 'biglegs_enemy_jump',
      frames: this.anims.generateFrameNumbers('biglegs_enemy_jump', {
        start: 0,
        end: 0
      }),
      frameRate: 6
    })

    this.anims.create({
      key: 'biglegs_enemy_death',
      frames: this.anims.generateFrameNumbers('biglegs_enemy_death', {
        start: 0,
        end: 4
      }),
      frameRate: 6
    })

    enemiesData.forEach(element => {
      const x = element[0]
      const y = element[1]
      const width = element[2]
      const height = element[3]
      const imageType = element[4]
      const movementType = element[5]
      // create enemy container
      const enemy = this.add.container(x, y)
      if (imageType === 'biglegs_enemy') { // bigleg enemy needs smaller container box
        enemy.setSize(width * 0.6, height)
      } else {
        enemy.setSize(width, height)
      }
      this.physics.world.enable(enemy)
      // add to enemies group
      this.enemies.add(enemy)

      // health bars
      const emptyHealthBar = this.add.line(0, -(enemy.height / 2) - 10, 0, 0, 20, 0, 0xaaaaaa, 100)
      emptyHealthBar.name = 'emptyHealthBar'
      const healthBar = this.add.line(0, -(enemy.height / 2) - 10, 0, 0, 10, 0, 0x00aa00)
      healthBar.name = 'healthBar'
      enemy.add([emptyHealthBar, healthBar])

      // create enemy game object (for animations etc.)
      const enemyGameObject = this.add.sprite(0, 0, imageType)
      enemyGameObject.name = 'enemyGameObject' // give it a key so we can retrieve it later
      enemyGameObject.setDisplaySize(width, height)
      enemy.movementType = movementType
      enemy.deathAnimationName = imageType + '_death'
      enemy.health = 10
      enemy.scoreValue = 10
      enemy.add(enemyGameObject)

      if (movementType === 'stationary_shooter') {
        enemy.scoreValue = 20
        enemy.health  = this.difficulty * 2 + 8
        const attackTrigger = this.physics.add.staticImage(x - 184, y + 8, 'ground')
        attackTrigger.setOrigin(0, 0)
        attackTrigger.setSize(20, 100)
        enemy.doAttack = () => {
          if (!enemy.active || enemy.isDead) {
            return
          }
          enemyGameObject.anims.play('dryad_idle_left')
          // do things in intervals
          setInterval(() => {
            if (!enemy.active || enemy.isDead) {
              return
            }
            // play attack animation
            enemyGameObject.anims.play('dryad_attack_left')
            // wait for correct animation frame
            setTimeout(() => {
              if (!enemy.active || enemy.isDead) {
                return
              }
              // create and shoot bullet
              const bullet = this.bullets.create(enemy.x - 8, enemy.y - 15, 'bullet')
              bullet.setVelocityX(-15 - this.difficulty * 50).setOrigin(0, 0).setGravityY(-298)

              this.sound.play('dryad_shot_sound')

              // back to idle animation
              enemyGameObject.anims.play('dryad_idle_left')
              // destroy bullet if it is too far/long
              setTimeout(() => {
                if (!enemy.active || enemy.isDead) {
                  return
                }
                if (bullet) {
                  bullet.destroy()
                }
              }, 10000)
            }, 800)
          }, 5000 - this.difficulty * 1000)
        }

        this.physics.add.collider(this.player, attackTrigger, () => {
          attackTrigger.destroy()
          enemy.doAttack()
        })
      }

      // movement
      if (movementType === 'flyer') {
        if (imageType === 'flying_enemy') {
          const followVelocity = this.difficulty * 20 + 40
          enemy.health  = this.difficulty * 2 + 3
          enemy.body.setVelocityX(followVelocity)
          enemyGameObject.anims.play('flying_enemy_right')
        }
      }

      if (movementType === 'trigger') {
        if (imageType === 'biglegs_enemy') {
          enemy.scoreValue = 50
          enemy.setDisplaySize(width * 0.6, height)
          enemyGameObject.setScale(1, 1)
          enemy.body.setBounceY(0.4)
          enemyGameObject.anims.play('biglegs_enemy_idle')
          enemy.followPlayer = () => {
            const followVelocity = this.difficulty * 20 + 40
            // keep refreshing player's position and follow player in correct direction
            const followInterval = setInterval(() => {
              if (!enemy.active || enemy.isDead || !this.player.active) {
                clearInterval(followInterval)
                return
              }
              const playerIsOnRight = this.player.body.x > enemy.x
              enemy.body.setVelocityX(playerIsOnRight ? followVelocity : -followVelocity)
              enemyGameObject.setScale(playerIsOnRight ? -1 : 1, 1)
              // if in jump we also need to center the enemy according to the animation
              if (enemyGameObject.anims.currentAnim.key === 'biglegs_enemy_jump') {
                enemyGameObject.setPosition(playerIsOnRight ? -(width / 4) : (width / 4), 0)
              }
              // only follow if is not jumping
              if (enemy.isAttacking) {
                clearInterval(followInterval) // stop interval
              }
            }, 1000)
          }
          enemy.doAttack = () => {
            if (!enemy.active || enemy.isDead) {
              return
            }
            enemy.isAttacking = true
            enemyGameObject.anims.play('biglegs_enemy_jump')
            const playerIsOnRight = this.player.body.x > enemy.x
            const atackVelocity = this.difficulty * 100
            // jump up
            enemy.body.setGravityY(-600)
            enemy.body.setVelocityX(playerIsOnRight ? atackVelocity : -atackVelocity)
            enemyGameObject.setScale(playerIsOnRight ? -1 : 1, 1)
            enemyGameObject.setPosition(playerIsOnRight ? -(width / 4) : (width / 4), 0)
            // when jumping also move teh health bar
            healthBar.setPosition(0, -(enemy.height / 2) - 20)
            emptyHealthBar.setPosition(0, -(enemy.height / 2) - 20)

            // move side in the air and down (using natural gravity)
            setTimeout(() => {
              if (!enemy.active || enemy.isDead) {
                return
              }
              enemy.body.setGravityY(-300)
              enemy.body.setVelocityX(playerIsOnRight ? atackVelocity : -atackVelocity)
              enemyGameObject.setScale(playerIsOnRight ? -1 : 1, 1)
              enemyGameObject.setPosition(playerIsOnRight ? -(width / 4) : (width / 4), 0)
            }, 500)
            // set normal gravity
            setTimeout(() => {
              if (!enemy.active || enemy.isDead) {
                return
              }
              enemy.body.setGravityY(0)
              enemy.body.setVelocityX(playerIsOnRight ? atackVelocity : -atackVelocity)
              enemyGameObject.setScale(playerIsOnRight ? -1 : 1, 1)
              enemyGameObject.setPosition(playerIsOnRight ? -(width / 4) : (width / 4), 0)
              enemy.isAttacking = false
              enemy.followPlayer()
            }, 700)
            // repeat attack
            setTimeout(() => {
              if (!enemy.active || enemy.isDead) {
                return
              }
              enemy.doAttack()
            }, 7000)
          }

          setTimeout(() => { // wait 4 seconds to let the enemy settle before creating the trigger
            const outerTrigger = this.physics.add.staticImage(enemy.x - 100, enemy.y, 'ground')
            outerTrigger.setOrigin(0, 0)
            outerTrigger.setSize(400, 200)
            this.physics.add.collider(this.player, outerTrigger, () => {
              outerTrigger.destroy()
              enemy.doAttack()
            }, null, this)
          }, 4000)
        }
      }

      // assign velocity to enemy object
      enemy.velocityX = enemy.body.velocity.x

      // TODO: ADD takeDamage function to enemy which will decrease health and refresh size of the health bar
      // TODO: call it when player attack happened
      // TODO: and call the die function from there as well when enemy has no health

      // die function
      enemy.die = function () {
        this.isDead = true
        this.getByName('enemyGameObject').anims.play(this.deathAnimationName)
        this.getByName('enemyGameObject').once('animationcomplete', () => {
          this.active = false
          this.destroy()
          // self.enemies.remove(this) // TODO: ?
          self.score += this.scoreValue
          self.updateHud()
          console.log('ENEMY DIED')
        })
      }
    })
    this.physics.add.collider(this.enemies, this.grounds, this.groundsTouchEventHandler, null, this)
    this.physics.add.collider(this.player, this.enemies, this.enemyTouchEventHandler, null, this)
    this.physics.add.collider(this.player, this.bullets, this.bulletTouchEventHandler, null, this)
    this.physics.add.collider(this.grounds, this.bullets, this.bulletTouchGroundEventHandler, null, this)
  }

  groundsTouchEventHandler (enemy, ground) {
    if (enemy.isDead) {
      return
    }

    if (enemy.movementType === 'flyer') {
      if (enemy.body.touching.left && ground.body.touching.right) {
        enemy.body.setVelocityX(50)
        enemy.getByName('enemyGameObject').anims.play('flying_enemy_right')
      } else if (enemy.body.touching.right && ground.body.touching.left) {
        enemy.body.setVelocityX(-50)
        enemy.getByName('enemyGameObject').anims.play('flying_enemy_left')
      }
    }

    if (enemy.movementType === 'stationary_shooter') {
      // nothing
    }

    if (enemy.movementType === 'trigger') {
      if (enemy.body.touching.down && ground.body.touching.up) {
        if (enemy.getByName('enemyGameObject').anims.currentAnim.key !== 'biglegs_enemy_idle') {
          enemy.getByName('enemyGameObject').anims.play('biglegs_enemy_idle')
          enemy.getByName('enemyGameObject').setPosition(0, 0)
          // reset health bar position
          enemy.getByName('healthBar').setPosition(0, -(enemy.height / 2) - 10)
          enemy.getByName('emptyHealthBar').setPosition(0, -(enemy.height / 2) - 10)
        }
      }
    }
    // assign velocity to enemy object because it may have changed
    enemy.velocityX = enemy.body.velocity.x
  }

  enemyTouchEventHandler (player, enemy) {
    if (enemy.isDead) {
      return
    }
    // enemy.disableBody(true, true);
    if (player.body.touching.left) {
      player.setPosition(player.x + 20, player.y - 5)
    } else if (player.body.touching.right) {
      player.setPosition(player.x - 20, player.y - 5)
    } else if (player.body.touching.down) {
      player.setPosition(player.x, player.y - 20)
    }
    const velocityX = enemy.velocityX
    // enemy.flipX = true
    // enemy.anims.playReverse()
    setTimeout(() => {
      enemy.body.setVelocityX(velocityX)
    }, 300)

    this.sound.play('player_hurt')

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
    this.sound.play('collect_soul_sound')
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

    this.sound.play('player_dead')
    this.forestOST.stop()

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
    window.game.scene.remove('Level1Scene')
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

    // score
    this.scoreText.setText('SCORE:' + this.score)
  }

  easterEgg () {
    const easterTrigger = this.physics.add.staticImage(1840, 1660, 'ground')
    easterTrigger.setOrigin(0, 0)
    easterTrigger.setSize(3620, 100)

    this.physics.add.collider(this.player, easterTrigger, () => {
      easterTrigger.destroy()
      this.sound.play('easter_egg', { volume: 0.1 })
      this.makePlayerDie()
    }, null, this)
  }

  setupSound () {
    this.forestOST = this.sound.add('forest_soundtrack', { volume: 0.1 }, true)
    this.sound.add('player_hurt')
    this.sound.add('dryad_shot_sound')
    this.sound.add('easter_egg')
    this.sound.add('collect_soul_sound')
    this.sound.add('player_dead')
  }

  playerAttack () {
    // TODO: Player hitbox shows for a milisecond away on attack.
    this.player.isAttacking = true
    const animationName = this.player.facingDirection == 'left' ? 'player_attack_left' : 'player_attack_right'
    this.player.anims.play(animationName, true)
    this.player.setOffset(this.player.facingDirection == 'left' ? 100 : 0, 0)
    this.player.setPosition(this.player.facingDirection == 'right' ? this.player.x + 50 : this.player.x - 50, this.player.y)
    const attackArea = this.physics.add.staticImage(this.player.facingDirection == 'left' ? this.player.x - 13 : this.player.x + 13, this.player.y, 'ground')
    attackArea.setOrigin(0, 0)
    attackArea.setSize(100, 40)
    this.physics.add.overlap(this.enemies, attackArea, (area, enemy) => {
      if (enemy.active === false || enemy.isDead) {
        return
      }
      attackArea.destroy()
      enemy.health -= 1
      if (enemy.health === 0) {
        enemy.die()
      }
    }, null, this)
    setTimeout(() => {
      this.player.anims.playReverse(animationName)
      setTimeout(() => {
        if (attackArea) {
          attackArea.destroy()
        }
        this.player.setOffset(0, 0)
        this.player.setPosition(this.player.facingDirection == 'right' ? this.player.x - 50 : this.player.x + 50, this.player.y)
        this.player.isAttacking = false
      }, 400)
    }, 400)
  }
}
