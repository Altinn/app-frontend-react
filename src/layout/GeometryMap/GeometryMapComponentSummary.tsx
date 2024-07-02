// import React from 'react';

// import classes from 'src/layout/GeometryMap/GeometryMapComponent.module.css';
//   import { Grid, Typography } from '@material-ui/core';

// import { Lang } from 'src/features/language/Lang';
// import type { LayoutNode } from 'src/utils/layout/LayoutNode';
// import { MapContainer, TileLayer } from 'react-leaflet';
// import { MapLayer } from '@altinn/altinn-design-system';

// export interface IGeometryMapComponentSummary {
//   targetNode: LayoutNode<'GeometryMap'>;
// }

// export function GeometryMapComponentSummary({ targetNode }: IGeometryMapComponentSummary) {
//   const layers: MapLayer[] = [
//     {
//       url: 'https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=europa_forenklet&zoom={z}&x={x}&y={y}',
//       attribution: 'Data © <a href="https://www.kartverket.no/">Kartverket</a>',
//     },
//     {
//       url: 'https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=norgeskart_bakgrunn2&zoom={z}&x={x}&y={y}',
//       attribution: 'Data © <a href="https://www.kartverket.no/">Kartverket</a>',
//     },
//   ];
//   const formData = targetNode.def.useDisplayData(targetNode);
//   const value = 'simpleBinding' in formData ? formData.simpleBinding : undefined;

//   return (
//     <Grid
//       item
//       xs={12}
//       className={location ? classes.mapContainer : undefined}
//     >
//       {location ? (
//         <>
//           <MapContainer
//             className={classes.map}
//             center={center}
//             ref={setMap}
//             zoom={polyCenter ? 12 : 8}
//             dragging={false}
//             attributionControl={false}
//           >
//             {layers.map((layer, i) => (
//               <TileLayer
//                 key={i}
//                 url={layer.url}
//                 attribution={layer.attribution}
//                 subdomains={layer.subdomains ? layer.subdomains : []}
//                 opacity={readOnly ? 0.5 : 1.0}
//               />
//             ))}
//             {geometryType == 'polygon' ? (
//               <Polygon positions={inputCoords}>
//                 <Tooltip>
//                   <span>Tekst</span>
//                 </Tooltip>
//               </Polygon>
//             ) : (
//               <div />
//             )}
//           </MapContainer>
//         </>
//       ) : (
//         <Typography
//           variant='body1'
//           className={classes.emptyField}
//         >
//           <Lang id={'general.empty_summary'} />
//         </Typography>
//       )}
//     </Grid>
//   );
// }
