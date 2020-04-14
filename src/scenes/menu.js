import config from './../config/config'
import Phaser from 'phaser'
import menuBackgroundImage from './../assets/images/shared/menu_background.png'
import menuButtonActiveImage from './../assets/images/shared/menu_button_active.png'
import menuSoundtrackAudio from './../assets/audio/menu/menuOST.mp3'
import menuButtonAudio from './../assets/audio/menu/ButtonPlay.mp3'
import menuButtonClick from './../assets/audio/menu/click.mp3'

export default class MenuScene extends Phaser.Scene {
  constructor () {
    super({ key: 'Menu' })
    window.game.difficulty = 2
  }

  preload () {
    this.load.image('menu_background', menuBackgroundImage)
    this.load.image('menu_button_active', menuButtonActiveImage)
    this.load.audio('menu_soundtrack', menuSoundtrackAudio)
    this.load.audio('menu_button_audio', menuButtonAudio)
    this.load.audio('menu_button_click', menuButtonClick)
  }

  create () {
    this.add.image(0, 0, 'menu_background').setOrigin(0, 0).setDisplaySize(config.width, config.height)

    this.button = this.add.image(370, 333, 'menu_button_active').setOrigin(0, 0).setDisplaySize(158, 52)
    this.difficultyLabel = this.add.text(750, 470, 'DIFFICULTY:', { fontFamily: 'Roboto', fontSize: '20px', fill: '#ccc' })
    this.difficulty1 = this.add.text(750, 500, 'CHILD', { fontFamily: 'Roboto', fontSize: '20px', fill: '#ccc' })
    this.difficulty2 = this.add.text(750, 525, 'NORMIE', { fontFamily: 'Roboto', fontSize: '20px', fill: '#c33' })
    this.difficulty3 = this.add.text(750, 550, 'DEVIL', { fontFamily: 'Roboto', fontSize: '20px', fill: '#ccc' })

    this.sound.add('menu_button_audio')
    this.sound.add('menu_button_click')

    this.button.setInteractive()
    this.button.on('pointerover', () => {
      this.button.setTint(0xff0000)
      this.sound.play('menu_button_audio')
    })

    this.button.on('pointerout', () => {
      this.button.clearTint()
    })

    this.button.on('pointerdown', () => {
      this.scene.start('Level1Scene')
      this.soundtrack.stop()
      this.sound.play('menu_button_click')
    })

    this.difficulty1.setInteractive()
    this.difficulty1.on('pointerover', () => {
      this.difficulty1.setColor('#fff')
      this.sound.play('menu_button_audio')
    })
    this.difficulty1.on('pointerout', () => {
      if (window.game.difficulty === 1) {
        this.difficulty1.setColor('#c33')
      } else {
        this.difficulty1.setColor('#ccc')
      }
    })
    this.difficulty1.on('pointerdown', () => {
      window.game.difficulty = 1
      this.difficulty1.setColor('#c33')
      this.difficulty2.setColor('#ccc')
      this.difficulty3.setColor('#ccc')
      this.sound.play('menu_button_click')
    })

    this.difficulty2.setInteractive()
    this.difficulty2.on('pointerover', () => {
      this.difficulty2.setColor('#fff')
      this.sound.play('menu_button_audio')
    })
    this.difficulty2.on('pointerout', () => {
      if (window.game.difficulty === 2) {
        this.difficulty2.setColor('#c33')
      } else {
        this.difficulty2.setColor('#ccc')
      }
    })
    this.difficulty2.on('pointerdown', () => {
      window.game.difficulty = 2
      this.difficulty1.setColor('#ccc')
      this.difficulty2.setColor('#c33')
      this.difficulty3.setColor('#ccc')
      this.sound.play('menu_button_click')
    })

    this.difficulty3.setInteractive()
    this.difficulty3.on('pointerover', () => {
      this.difficulty3.setColor('#fff')
      this.sound.play('menu_button_audio')
    })
    this.difficulty3.on('pointerout', () => {
      if (window.game.difficulty === 3) {
        this.difficulty3.setColor('#c33')
      } else {
        this.difficulty3.setColor('#ccc')
      }
    })
    this.difficulty3.on('pointerdown', () => {
      window.game.difficulty = 3
      this.difficulty1.setColor('#ccc')
      this.difficulty2.setColor('#ccc')
      this.difficulty3.setColor('#c33')
      this.sound.play('menu_button_click')
    })

    this.soundtrack = this.sound.add('menu_soundtrack', { volume: 0.1 }, true)

    this.soundtrack.play()
  }
}
