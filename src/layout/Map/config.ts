import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';

export const MAP_SUMMARY_OVERRIDE_PROPS = new CG.obj()
  .extends(CG.common('ISummaryOverridesCommon'))
  .optional()
  .setTitle('Summary properties')
  .setDescription('Properties for how to display the summary of the component')
  .exportAs('MapSummaryOverrideProps');

export const Config = new CG.component({
  category: CompCategory.Form,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
    renderInCards: false,
    renderInCardsMedia: false,
    renderInTabs: true,
  },
  functionality: {
    customExpressions: false,
  },
})
  .addDataModelBinding(
    new CG.obj(
      new CG.prop('simpleBinding', new CG.dataModelBinding().optional()),
      new CG.prop(
        'geometries',
        new CG.dataModelBinding()
          .optional()
          .setDescription('Should point to an array of objects like {data: string, label: string}'),
      ),
    ).exportAs('IDataModelBindingsForMap'),
  )
  .addProperty(
    new CG.prop(
      'wmsLayers',
      new CG.arr(
        new CG.obj(
          new CG.prop('url', new CG.str().setTitle('Map layer url').setDescription('Url to a wms-type map server')),
          new CG.prop('layers', new CG.str()),
          new CG.prop(
            'attribution',
            new CG.str()
              .optional()
              .setTitle('Attribution')
              .setDescription('Ascribing a work or remark to a particular unit for recognition'),
          ),
          new CG.prop(
            'subdomains',
            new CG.arr(new CG.str())
              .optional()
              .setTitle('Subdomains')
              .setDescription(
                'List of subdomains. Used for balancing the load on different map tiling servers. ' +
                  'A random one will replace {s} in the defined url.',
              ),
          ),
          new CG.prop(
            'format',
            new CG.str()
              .optional({ default: 'image/jpeg' })
              .setTitle('Format')
              .setDescription(
                'The MIME type of the WMS tiles to request from the WMS server, as specified by the WMS standard',
              ),
          ),
          new CG.prop(
            'version',
            new CG.str()
              .optional({ default: '1.1.1' })
              .setTitle('WMS Version')
              .setDescription('The version of the WMS standard to use'),
          ),
          new CG.prop(
            'opacity',
            new CG.num()
              .optional({ default: 1.0 })
              .setTitle('Layer Opacity')
              .setDescription('The opacity of the WMS layer, ranging from 0 (fully transparent) to 1 (fully opaque)'),
          ),
          new CG.prop(
            'zoomOffset',
            new CG.num()
              .optional({ default: 0 })
              .setTitle('Zoom Offset')
              .setDescription('The zoom offset for the WMS layer'),
          ),
          new CG.prop(
            'tileSize',
            new CG.num()
              .optional({ default: 2048 })
              .setTitle('Tile Size')
              .setDescription('The size of the tiles in pixels'),
          ),
          new CG.prop(
            'transparent',
            new CG.bool()
              .optional({ default: false })
              .setTitle('Transparency')
              .setDescription('Whether the WMS layer should be transparent'),
          ),
          new CG.prop(
            'uppercase',
            new CG.bool()
              .optional({ default: false })
              .setTitle('Uppercase')
              .setDescription('Whether the WMS parameters should be uppercase'),
          ),
          new CG.prop(
            'minZoom',
            new CG.num()
              .optional({ default: 0 })
              .setTitle('Minimum Zoom Level')
              .setDescription('The minimum zoom level for the WMS layer'),
          ),
          new CG.prop(
            'maxZoom',
            new CG.num()
              .optional({ default: 18 })
              .setTitle('Maximum Zoom Level')
              .setDescription('The maximum zoom level for the WMS layer'),
          ),
        )
          .exportAs('MapLayersWMS')
          .setDescription('WMS-type map layers'),
      ).optional(),
    ),
  )
  .addProperty(
    new CG.prop(
      'layers',
      new CG.arr(
        new CG.obj(
          new CG.prop(
            'url',
            new CG.str()
              .setTitle('Map layer url')
              .setDescription(
                'Url to a map tile. {z}/{x}/{y} will be replaced with tile coordinates, {s} will be ' +
                  'replaced with a random subdomain if subdomains are given',
              ),
          ),
          new CG.prop(
            'attribution',
            new CG.str()
              .optional()
              .setTitle('Attribution')
              .setDescription('Ascribing a work or remark to a particular unit for recognition'),
          ),
          new CG.prop(
            'subdomains',
            new CG.arr(new CG.str())
              .optional()
              .setTitle('Subdomains')
              .setDescription(
                'List of subdomains. Used for balancing the load on different map tiling servers. ' +
                  'A random one will replace {s} in the defined url.',
              ),
          ),
        ).exportAs('MapLayer'),
      ).optional(),
    ),
  )
  .addProperty(
    new CG.prop(
      'centerLocation',
      new CG.obj(new CG.prop('latitude', new CG.num()), new CG.prop('longitude', new CG.num()))
        .optional()
        .exportAs('Location')
        .setTitle('Center location')
        .setDescription('Center location of the map'),
    ),
  )
  .addProperty(new CG.prop('zoom', new CG.num().optional()))
  .addProperty(
    new CG.prop(
      'geometryType',
      new CG.enum('GeoJSON', 'WKT').optional({ default: 'GeoJSON' }).exportAs('IGeometryType'),
    ),
  )
  .extends(CG.common('LabeledComponentProps'))
  .extendTextResources(CG.common('TRBLabel'));
