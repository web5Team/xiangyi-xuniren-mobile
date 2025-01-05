export const useLoginState = createGlobalState(() => {
  const data = reactive({
    dialogVisible: false,
    identifier: '',
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
