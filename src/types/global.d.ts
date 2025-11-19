export {}

declare global {
  interface DataItem {
    buttonText: string;
    imageSrc: string;
    subtitle: string;
    title: string;
  }
  
}

// types/konva.d.ts
declare module 'konva' {
  const content: any;

  export default content;
}

// src/declarations.d.ts
declare module 'use-image' {
  const useImage: (url: string, crossOrigin?: string) => [HTMLImageElement | undefined, boolean];

  export default useImage;
}


