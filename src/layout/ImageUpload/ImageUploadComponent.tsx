import React, { useState } from 'react';

import { DownloadIcon as Download } from '@navikt/aksel-icons';

import { Flex } from 'src/app-components/Flex/Flex';
import { HelpTextContainer } from 'src/components/form/HelpTextContainer';
import { Lang } from 'src/features/language/Lang';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { ImageCropper } from 'src/layout/ImageUpload/ImageCropper';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export function ImageUploadComponent({ baseComponentId }: PropsFromGenericComponent<'ImageUpload'>) {
  const { textResourceBindings } = useItemWhenType(baseComponentId, 'ImageUpload');

  const altText = 'welp';

  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  return (
    <ComponentStructureWrapper baseComponentId={baseComponentId}>
      <Flex
        container
        direction='row'
        spacing={2}
        justifyContent='center'
      >
        <Flex
          item
          style={{ flexBasis: 'auto' }}
        >
          <div className='bg-white rounded-2xl shadow-xl p-6 md:p-8'>
            <ImageCropper onCrop={setCroppedImage} />
          </div>

          {croppedImage && (
            <div className='mt-8 bg-white rounded-2xl shadow-xl p-6 md:p-8'>
              <h2 className='text-2xl font-bold text-gray-800 text-center mb-6'>Cropped Result</h2>
              <div className='flex flex-col items-center justify-center'>
                <img
                  src={croppedImage}
                  alt='Cropped result'
                  className='max-w-full h-auto rounded-lg shadow-md'
                />
                <a
                  href={croppedImage}
                  download='cropped-image.png'
                  className='mt-6 inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                >
                  <Download className='mr-2 h-5 w-5' />
                  Download Image
                </a>
              </div>
            </div>
          )}
        </Flex>
        {textResourceBindings?.help && (
          <Flex
            item
            style={{ letterSpacing: '0.3px', flexBasis: 'auto' }}
          >
            <HelpTextContainer
              helpText={<Lang id={textResourceBindings.help} />}
              title={altText}
            />
          </Flex>
        )}
      </Flex>
    </ComponentStructureWrapper>
  );
}
