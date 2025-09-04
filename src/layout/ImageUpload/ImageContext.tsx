import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

import { getViewport } from 'src/layout/ImageUpload/imageUploadUtils';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import type { IDataModelBindingsSimple } from 'src/layout/common.generated';
import type { Viewport } from 'src/layout/ImageUpload/imageUploadUtils';

type PositionType = { x: number; y: number };

type ImageContextType = {
  imageSrc: File | null;
  setImageSrc: (src: File | null) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  position: PositionType;
  setPosition: React.Dispatch<React.SetStateAction<PositionType>>;
  baseComponentId: string;
  dataModelBindings: IDataModelBindingsSimple | undefined;
  selectedViewport: Viewport;
};

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const useImageContext = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useImageContext must be used within ImageProvider');
  }
  return context;
};

type ImageProviderProps = {
  baseComponentId: string;
  children: ReactNode;
};

export const ImageProvider = ({ baseComponentId, children }: ImageProviderProps) => {
  const [imageSrc, setImageSrc] = useState<File | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState<PositionType>({ x: 0, y: 0 });
  const { dataModelBindings, viewport } = useItemWhenType(baseComponentId, 'ImageUpload');
  const selectedViewport = getViewport(viewport);

  return (
    <ImageContext.Provider
      value={{
        imageSrc,
        setImageSrc,
        zoom,
        setZoom,
        position,
        setPosition,
        baseComponentId,
        dataModelBindings,
        selectedViewport,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};
