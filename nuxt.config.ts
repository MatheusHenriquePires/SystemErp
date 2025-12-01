export default defineNuxtConfig({
  typescript: {
    shim: false,
    strict: true,
    typeCheck: true,
    tsConfig: {
      compilerOptions: {
        moduleResolution: "bundler"
      }
    }
  }
})
