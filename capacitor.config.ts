import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.tagzxia.xiangyi',
  appName: 'xiangyi',
  webDir: '.output/public',
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
}

export default config
