import dialogPolyfill from 'dialog-polyfill'

export function isAssetTypeAnImg(path) {
  const type = [
    'png',
    'jpg',
    'jpeg',
    'bmp',
    'gif',
    'webp',
    'psd',
    'svg',
    'tiff',
  ]
  var index = path.lastIndexOf('.')
  var ext = path.substr(index + 1)
  return type.find((item) => item === ext) == undefined ? ext : true
}

export function switchFileIcon(file) {
  const type = isAssetTypeAnImg(file.name)
  switch (type) {
    case true:
      return '#iconfilesimg'
    case 'pdf':
      return '#iconpdf'
    case 'doc':
      return '#iconword'
    case 'excel':
      return '#iconexcel'
    case 'xlsx':
      return '#iconexcel'
    case 'xls':
      return '#iconexcel'
    case 'docx':
      return '#iconword'
    default:
      return '#iconfiles-pack-small'
  }
}

export function registerDialog(dialog) {
  if (dialog.length > 1) {
    dialog.forEach((element) => {
      dialogPolyfill.registerDialog(element)
    })
  } else {
    dialogPolyfill.registerDialog(dialog)
  }
}
