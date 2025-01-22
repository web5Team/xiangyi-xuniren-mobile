export const useLoginState = createGlobalState(() => {
  const data = reactive({
    mode: 'login',
    dialogVisible: false,
    identifier: '',
    certificate: '',
    name: '相一',
    stashedToken: '',
  })

  return {
    data,
  }
})

export interface INextCompOptions {
  title: string
  canBack: boolean
}

export declare function nextComp(component: Component, options: INextCompOptions): void

// export const nextComp: async function nextComp(component: Component, title: string);
