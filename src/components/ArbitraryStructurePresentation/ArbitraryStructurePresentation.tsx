import React from 'react';

import { Card, Heading, Link, Paragraph } from '@digdir/designsystemet-react';
import type { HeadingProps } from '@digdir/designsystemet-react';

import classes from 'src/components/PresentationLayoutComponents/ArbitraryStructurePresentation.module.css';

type BasicAllowedTypes = string | number | boolean;
type LinkType = { value: string; href: string; icon?: string };
type BasicAllowedObject = {
  title?: string;
  description?: string;
  data: { [key: string]: BasicAllowedTypes | LinkType };
};
type AllowedList = (BasicAllowedTypes | LinkType | BasicAllowedObject)[];
type AllowedObject = {
  title?: string;
  description?: string;
  data: { [key: string]: BasicAllowedTypes | LinkType | BasicAllowedObject | AllowedList };
};

type InputStructure = {
  title?: string;
  description?: string;
  data: (BasicAllowedTypes | LinkType | AllowedList | AllowedObject)[];
};

type PresentationConfig = {
  shouldShowHeaders?: boolean;
  presentationDataId: string;
  direction?: 'horizontal' | 'vertical';
};

function isBasicType(value: unknown): value is BasicAllowedTypes {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

type ArbitraryStructureComponentProps = {
  input: InputStructure;
  config: PresentationConfig;
};

export function ArbitraryStructureComponent({
  input: { data, ...sectionData },
  config,
}: ArbitraryStructureComponentProps) {
  const direction = config.direction ?? 'vertical';

  return (
    <Card color='first'>
      <dl>
        <SectionIntro
          {...sectionData}
          level={3}
        />
        <div className={classes[direction]}>
          {data.map((dataItem) => (
            <div key={String(dataItem)}>
              <PresentDataItem
                dataItem={dataItem}
                direction={direction}
              />
            </div>
          ))}
        </div>
      </dl>
    </Card>
  );
}

type PresentDataItemProps = {
  dataItem: BasicAllowedTypes | LinkType | AllowedList | AllowedObject;
  direction: 'horizontal' | 'vertical';
};

function PresentDataItem({ dataItem, direction }: PresentDataItemProps) {
  if (isBasicType(dataItem)) {
    return <div>{dataItem}</div>;
  }

  if (isLink(dataItem)) {
    return <Link to={dataItem.href}>{dataItem.value}</Link>;
  }

  if (Array.isArray(dataItem)) {
    return (
      <div className={classes[direction]}>
        {dataItem.map((item) => (
          <PresentDataItem
            key={String(item)}
            dataItem={item}
            direction={direction}
          />
        ))}
      </div>
    );
  }

  const { data, ...sectionData } = dataItem;
  return (
    <div>
      <SectionIntro
        {...sectionData}
        level={4}
      />
      <div className={classes[direction]}>
        {Object.entries(data).map(([key, value]) => (
          <div
            key={key}
            className={classes['presentationDataItem']}
          >
            <dt>{key}</dt>
            <dd>
              <PresentDataItem
                dataItem={value}
                direction={direction}
              />
            </dd>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionIntro({
  level,
  title,
  description,
}: {
  level: NonNullable<HeadingProps['level']>;
  title?: string;
  description?: string;
}) {
  if (!title && !description) {
    return null;
  }

  return (
    <div className={classes.sectionIntro}>
      {title && (
        <Heading
          size='small'
          level={level}
        >
          {title}
        </Heading>
      )}
      {description && <Paragraph size='small'>{description}</Paragraph>}
    </div>
  );
}

function isLink(value: unknown): value is LinkType {
  return typeof value === 'object' && value !== null && 'value' in value && 'href' in value;
}
