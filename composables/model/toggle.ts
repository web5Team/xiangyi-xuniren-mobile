import * as THREE from 'three'
import { AnimationInterval, modelManager } from '.'

const dissolveShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 }, // 控制溶解时间
    dissolveHeight: { value: 0 }, // 控制溶解高度
    map: { value: null }, // 模型的纹理
  },
  vertexShader: `
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vPosition = position;
          vUv = uv; // 传递 UV 坐标
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
  fragmentShader: `
        uniform float time;
        uniform float dissolveHeight;
        uniform sampler2D map; // 模型的纹理
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          // 如果低于融化高度，直接消失
          if (vPosition.y < dissolveHeight) {
            discard;
          }

          // 采样模型的纹理，保留原始颜色
          vec4 textureColor = texture2D(map, vUv);
          gl_FragColor = textureColor;
        }
      `,
  transparent: true, // 启用透明度
})

export class ToggleManager {
  #mode: boolean

  startFadeIn() {
    this.#mode = true
  }

  startFadeOut() {
    this.#mode = false
  }

  getInterval() {
    // 控制溶解和粒子动画
    let time = 0

    function applyFadeShader(vrm: any) {
      // 把材质应用到角色模型
      vrm.scene.traverse((child) => {
        if (child.isMesh) {
          const originalMaterial = child.material

          // 创建新的 Shader 材质，并传递原始材质的纹理
          const material = dissolveShaderMaterial.clone()
          if (originalMaterial.map)
            material.uniforms.map.value = originalMaterial.map
          else
            console.warn('Model texture (map) not found!')

          // 应用新的 Shader 材质
          child.material = material
        }
      })
    }

    const toggleInterval = new AnimationInterval(10, (vrm: any) => {
      if (!toggleInterval.data.install) {
        toggleInterval.data.install = true

        applyFadeShader(vrm)
      }

      // 如果完全溶解，停止动画
      if (time > 10)
        return

      // 更新时间
      time += 0.01
      dissolveShaderMaterial.uniforms.time.value = time

      // 更新溶解高度
      const dissolveHeight = time * 2.0
      dissolveShaderMaterial.uniforms.dissolveHeight.value = dissolveHeight

      // if (!toggleInterval.data.install) {
      //   toggleInterval.data.install = true

      //   applyFadeShader(vrm)
      // }

      // if (!this.#mode && toggleInterval.data.weight < 5) {
      //   toggleInterval.data.weight += 0.2
      //   dissolveShaderMaterial.uniforms.meltHeight.value = toggleInterval.data.weight
      // }
      // else if (this.#mode && toggleInterval.data.weight > -5) {
      //   toggleInterval.data.weight -= 0.2
      //   dissolveShaderMaterial.uniforms.meltHeight.value = toggleInterval.data.weight
      // }
    })
    toggleInterval.data.weight = 0

    return toggleInterval
  }
}

export const toggleManager = new ToggleManager()
