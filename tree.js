/*
 * Copyright (c) 2008-2015 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

Ext.require([
    'Ext.container.Viewport',
    'Ext.layout.container.Border',
    'GeoExt.tree.Panel',
    'Ext.tree.plugin.TreeViewDragDrop',
    'GeoExt.panel.Map',
    'GeoExt.tree.OverlayLayerContainer',
    'GeoExt.tree.BaseLayerContainer',
    'GeoExt.data.LayerTreeModel',
    'GeoExt.tree.View',
    'GeoExt.tree.Column'
]);

var mapPanel, tree;

Ext.application({
    name: 'Tree',
    launch: function() {
        // create a map panel with some layers that we will show in our layer tree
        // below.
        mapPanel = Ext.create('GeoExt.panel.Map', {
            border: true,
            region: "center",
            // we do not want all overlays, to try the OverlayLayerContainer
            map: {allOverlays: false},
            center: [-1.5622538616188,12.334806062832],
            zoom: 10,
            layers: [
               
                new OpenLayers.Layer.WMS("OpenStreetMap WMS",
                    "https://ows.terrestris.de/osm/service?",
                    {layers: 'OSM-WMS'},
                    {
                        attribution: '&copy; terrestris GmbH & Co. KG <br>' +
                            'Data &copy; OpenStreetMap ' +
                            '<a href="http://www.openstreetmap.org/copyright/en"' +
                            'target="_blank">contributors<a>'
                    }
                ),
                new OpenLayers.Layer.WMS("Grand Ouaga",
                    "http://localhost:8080/geoserver/web_space/wms", {
                        layers: "web_space:Grand Ouaga",
                        transparent: true,
                        format: "image/png"
                    }, {
                        isBaseLayer: false,
                        
                        buffer: 0
                    }
                ),
                new OpenLayers.Layer.WMS("Ouaga",
                    "http://localhost:8080/geoserver/web_space/wms", {
                        layers: "web_space:Ouaga",
                        transparent: true,
                        format: "image/png"
                    }, {
                        isBaseLayer: false,
                        buffer: 0
                    }
                ),
                new OpenLayers.Layer.WMS("Routes",
                    "http://localhost:8080/geoserver/web_space/wms",
                    {
                        layers: 'web_space:Routes',
                        format: 'image/png',
                        transparent: true
                    },
                    {
                        singleTile: true,
                        visibility: true
                    }
                ),
				new OpenLayers.Layer.WMS("Infrastructures routieres",
                    "http://localhost:8080/geoserver/web_space/wms",
                    {
                        layers: 'web_space:Infrastructures routieres',
                        format: 'image/png',
                        transparent: true
                    },
                    {
                        singleTile: true,
                        visibility: true
                    }
                ),
                // create a group layer (with several layers in the "layers" param)
                // to show how the LayerParamLoader works
                new OpenLayers.Layer.WMS("Tasmania (Group Layer)",
                    "http://demo.opengeo.org/geoserver/wms", {
                        layers: [
                            "topp:tasmania_state_boundaries",
                            "topp:tasmania_water_bodies",
                            "topp:tasmania_cities",
                            "topp:tasmania_roads"
                        ],
                        transparent: true,
                        format: "image/gif"
                    }, {
                        isBaseLayer: false,
                        buffer: 0,
                        // exclude this layer from layer container nodes
                        displayInLayerSwitcher: false,
                        visibility: false
                    }
                )
            ]
        });

        // create our own layer node UI class, using the TreeNodeUIEventMixin
        //var LayerNodeUI = Ext.extend(GeoExt.tree.LayerNodeUI, new GeoExt.tree.TreeNodeUIEventMixin());

        /*var treeConfig = [
            {nodeType: 'gx_layercontainer', layerStore: map.layers}
        {
            nodeType: "gx_baselayercontainer"
        }, {
            nodeType: "gx_overlaylayercontainer",
            expanded: true,
            // render the nodes inside this container with a radio button,
            // and assign them the group "foo".
            loader: {
                baseAttrs: {
                    radioGroup: "foo",
                    uiProvider: "layernodeui"
                }
            }
        }, {
            nodeType: "gx_layer",
            layer: "Tasmania (Group Layer)",
            isLeaf: false,
            // create subnodes for the layers in the LAYERS param. If we assign
            // a loader to a LayerNode and do not provide a loader class, a
            // LayerParamLoader will be assumed.
            loader: {
                param: "LAYERS"
            }
        }];*/


        var store = Ext.create('Ext.data.TreeStore', {
            model: 'GeoExt.data.LayerTreeModel',
            root: {
                expanded: true,
                children: [
                    {
                        plugins: [{
                            ptype: 'gx_layercontainer',
                            store: mapPanel.layers
                        }],
                        expanded: true
                    }, {
                        plugins: ['gx_baselayercontainer'],
                        expanded: true,
                        text: "Fond de carte"
                    }, {
                        plugins: ['gx_overlaylayercontainer'],
                        expanded: true
                    }
                ]
            }
        });

        var layer;

        // create the tree with the configuration from above
        tree = Ext.create('GeoExt.tree.Panel', {
            border: true,
            region: "west",
            title: "Bienvenu sur votre webmap",
            width: 280,
            split: true,
            collapsible: true,
            collapseMode: "mini",
            autoScroll: true,
            store: store,
            rootVisible: false,
            lines: false,
            tbar: [{
                text: "Retirez une couche",
                handler: function() {
                    layer = mapPanel.map.layers[2];
                    mapPanel.map.removeLayer(layer);
                }
            }, {
                text: "Ajoutez une couche",
                handler: function() {
                    mapPanel.map.addLayer(layer);
                }
            }]
        });

        Ext.create('Ext.Viewport', {
            layout: "fit",
            hideBorders: true,
            items: {
                layout: "border",
                deferredRender: false,
                items: [mapPanel, tree, {
                    contentEl: "desc",
                    region: "east",
                    bodyStyle: {"padding": "5px"},
                    collapsible: true,
                    collapseMode: "mini",
                    split: true,
                    width: 230,
                    title: "En quoi cocnsiste ce projet ?"
                }]
            }
        });
    }
});