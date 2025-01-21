import { WebPermissionResolver } from './web-permission-resolver'
import { CapacitorPermissionResolver } from './capacitor-permission-resolver'

export interface IPermissionResolver {
  requestPermission: (permission: string) => void
  onSuccess: (callback: () => void) => void
  onFailure: (callback: (error: any) => void) => void
}

export class PermissionResolver {
  private permissionResolver: IPermissionResolver

  constructor() {
    if (typeof window !== 'undefined' && (window as any).Capacitor)
      this.permissionResolver = new CapacitorPermissionResolver()
    else
      this.permissionResolver = new WebPermissionResolver()
  }

  requestPermission(permission: string): void {
    this.permissionResolver.requestPermission(permission)
  }

  onSuccess(callback: () => void): void {
    this.permissionResolver.onSuccess(callback)
  }

  onFailure(callback: (error: any) => void): void {
    this.permissionResolver.onFailure(callback)
  }
}
