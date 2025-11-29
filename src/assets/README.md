# Images Folder

Folder ini digunakan untuk menyimpan gambar yang akan di-import di dalam komponen React.

## Cara Menggunakan

```jsx
import logo from '../assets/images/logo.png'

function Component() {
  return <img src={logo} alt="Logo" />
}
```

## Keuntungan
- Gambar dioptimalkan oleh Vite saat build
- Path di-resolve otomatis
- Dapat menggunakan dynamic imports

