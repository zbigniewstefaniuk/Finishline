declare module 'virtual:app-version' {
  const buildInfo: { buildId: string; builtAt: string }
  export default buildInfo
}
