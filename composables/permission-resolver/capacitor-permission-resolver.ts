import type { IPermissionResolver } from '.';

export class CapacitorPermissionResolver implements IPermissionResolver {
    private successCallback: () => void = () => {};
    private failureCallback: (error: any) => void = (error) => {};

    requestPermission(permission: string): void {
        // 模拟请求权限逻辑
        if (/* 权限请求成功 */) {
            this.successCallback();
        } else {
            this.failureCallback(new Error("Permission denied"));
        }
    }

    onSuccess(callback: () => void): void {
        this.successCallback = callback;
    }

    onFailure(callback: (error: any) => void): void {
        this.failureCallback = callback;
    }
}