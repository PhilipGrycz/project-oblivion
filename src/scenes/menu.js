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

    this.soundtrack = this.sound.add('menu_soundtrack', { volume: 0.1 }, true)

    this.soundtrack.play()
  }
}
