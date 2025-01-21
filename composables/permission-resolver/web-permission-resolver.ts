import type { IPermissionResolver } from '.'
import { ensurePermissions, permissionGranted } from '~/components/chore/model/model-manager'

export class WebPermissionResolver implements IPermissionResolver {
  private successCallback: () => void = () => { }
  private failureCallback: (error: any) => void = () => { }

  async requestPermission() {
    await ensurePermissions()

    if (permissionGranted) {
      this.successCallback()

      return true
    }
    else {
      this.failureCallback(new Error('Permission denied'))

      return false
    }
  }

  onSuccess(callback: () => void): void {
    this.successCallback = callback
  }

  onFailure(callback: (error: any) => void): void {
    this.failureCallback = callback
  }
}
