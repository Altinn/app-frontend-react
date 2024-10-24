import React from 'react';

import { Heading, Skeleton } from '@digdir/designsystemet-react';

import classes from 'src/layout/Payment/SkeletonLoader/SkeletonLoader.module.css';

export const SkeletonLoader = () => (
  <div className={classes.skeletonWrapper}>
    <Skeleton
      variant='rectangle'
      width='100%'
      height='150px'
    />
    <div className={classes.titleContainer}>
      <Skeleton
        variant='circle'
        width='30px'
        height='30px'
      />
      <Heading
        asChild
        size='md'
      >
        <Skeleton variant='text'>En medium tittel</Skeleton>
      </Heading>
    </div>
    <Skeleton
      variant='text'
      width='100%'
    />
    <Skeleton
      variant='text'
      width='100%'
    />
    <Skeleton
      variant='text'
      width='80%'
    />
  </div>
);
