import HiPose from './hi.vroidpose?raw'
import YePose from './ye.vroidpose?raw'

export class PoseManager {
  pose: any

  constructor(pose: string) {
    this.pose = JSON.parse(pose)
  }

  ind: number = 0

  apply(vrm: any) {
    const bodies = [...Object.keys(this.pose.BoneDefinition)].map((item) => {
      return {
        key: item,
        value: this.pose.BoneDefinition[item],
      }
    })

    // console.log(bodies)

    bodies.forEach(({ key, value }) => {
      const [f, ...left] = key
      const bodyName = [f.toLocaleLowerCase(), ...left].join('')

      const target = vrm.humanoid.humanBones[bodyName]
      if (!target) {
        // console.warn(`${bodyName} not found`, { target, key, value, bodyName })
        return
      }

      Object.assign(target.node.quaternion, value)
    })

    const d = this.pose.VRoidCustomData.PoseGizmoDefinitions

    const index = (this.ind + 1) % d.length

    Object.assign(vrm.scene.quaternion, d[index])
  }
}

export const Posed = {
  HiPose,
  YePose,
}
