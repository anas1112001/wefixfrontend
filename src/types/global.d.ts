export {}

declare global {
  interface DataItem {
    buttonText: string;
    imageSrc: string;
    subtitle: string;
    title: string;
  }

  namespace google {
    namespace maps {
      class Map {
        constructor(mapDiv: HTMLElement, opts?: MapOptions);

        addListener(eventName: string, handler: (event: MapMouseEvent) => void): void;
      }

      class Marker {
        constructor(opts?: MarkerOptions);

        getPosition(): LatLng | null;

        setPosition(position: LatLng | LatLngLiteral): void;

        addListener(eventName: string, handler: () => void): void;
      }

      interface MapOptions {
        center?: LatLngLiteral;
        zoom?: number;
      }

      interface MarkerOptions {
        draggable?: boolean;
        map?: Map;
        position?: LatLngLiteral;
      }

      interface LatLng {
        lat(): number;

        lng(): number;
      }

      interface LatLngLiteral {
        lat: number;
        lng: number;
      }

      interface MapMouseEvent {
        latLng?: LatLng;
      }
    }
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


