export const useLoginState = createGlobalState(() => {
  const data = reactive({
    identifier: '',
  })

  return {
    data,
  }
})
