export function fileNameExtensionRemover(params: string) {
  const extension = params.split('.').splice(-1).shift();
  return extension;
}
