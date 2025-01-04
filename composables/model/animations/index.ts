import * as THREE from 'three'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'

export class AnimationManager {
  mixer: any

  apply(animation: string, scene: THREE.Scene) {
    console.log('scene', scene)
    const loader = new FBXLoader()

    loader.load(animation, (fbx: any) => {
      scene.add(fbx.scene)

      fbx.animations.forEach((clip: any) => {
        scene.animations.push(clip)
      })

      // const animationObj = fbx.animations[0]

      if (fbx.animations.length > 0) {
        console.log('a', { fbx })
        this.mixer = new THREE.AnimationMixer(scene)
        fbx.animations.forEach((clip: any) => {
          this.mixer.clipAction(clip).play()
        })
        // const action = this.mixer.clipAction(fbx.animations[0])
        // action.play()
      }
    })

    return this.mixer
  }

  onAnimate(vrm: any, delta: any) {
    if (this.mixer)
      this.mixer.update(delta)

    // console.log('update animation', this.mixer, vrm, delta)
  }
}
