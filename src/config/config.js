import Phaser from 'phaser'
import MenuScene from './../scenes/menu'

export default {
  type: Phaser.AUTO,
  width: 900,
  height: 600,
  pixelArt: true,
  // zoom: 2,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: true
    },
    matter: {
      debug: true,
      gravity: { y: 0.5 }
    },
    impact: {
      gravity: 100,
      debug: true,
      setBounds: {
        x: 100,
        y: 100,
        width: 600,
        height: 300,
        thickness: 32
      },
      maxVelocity: 500
    }
  },
  scene: [
    MenuScene
  ]
}
