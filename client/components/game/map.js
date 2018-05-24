import {MapService} from '../../services/map.js'
import {ServerService} from '../../services/server.js';
import {ContextMenu} from '../generic/context-menu.js';
import './actions.js';
import '../generic/better-radial-progress.js';

const NODE_AREA = 60;

Vue.component('world-map', {
    data: () => ({
        NODE_AREA,
        dragging: false,
        expanded: false,
        mapOffset: {},
    }),

    subscriptions() {
        const mapDataStream = MapService.getMapStream();
        const nodesStream = mapDataStream
            .map(data => {
                const map = {};

                data.forEach(node => {
                    map[node.id] = node;
                    node.paths.forEach(pathNode => {
                        map[pathNode.id] = pathNode;
                    });
                });

                return Object.values(map);
            });
        const boxStream = nodesStream
            .map(nodes => {
                let left = Infinity;
                let top = Infinity;
                let right = -Infinity;
                let bottom = -Infinity;
                nodes.forEach(node => {
                    if (node.x < left) left = node.x;
                    if (node.y < top) top = node.y;
                    if (node.x > right) right = node.x;
                    if (node.y > bottom) bottom = node.y;
                });
                return { left, top, bottom, right };
            });
        const sizeStream = boxStream
            .map(box => ({
                width: (box.right - box.left + 1) * NODE_AREA,
                height: (box.bottom - box.top + 1) * NODE_AREA,
            }));
        const nodeTokensStream = Rx.Observable
            .combineLatest([
                nodesStream,
                boxStream,
            ])
            .map(([ nodes, box ]) => {
                const offsetX = -box.left * NODE_AREA + NODE_AREA / 2;
                const offsetY = -box.top * NODE_AREA + NODE_AREA / 2;
                return nodes.map(node => ({
                    ...node,
                    x: node.x * NODE_AREA + offsetX,
                    y: node.y * NODE_AREA + offsetY,
                }));
            });
        const pathsStream = Rx.Observable
            .combineLatest([
                mapDataStream,
                boxStream,
            ])
            .map(([nodes, box]) => {
                const paths = {};
                const offsetX = -box.left * NODE_AREA + NODE_AREA / 2;
                const offsetY = -box.top * NODE_AREA + NODE_AREA / 2;

                nodes.forEach(node => {
                    node.paths.forEach(travelNode => {
                        let lowerId = Math.min(node.id, travelNode.id);
                        let higherId = Math.max(node.id, travelNode.id);

                        paths[`${lowerId}-${higherId}`] = {
                            position: {
                                x: Math.round((node.x + travelNode.x) / 2 * NODE_AREA + offsetX),
                                y: Math.round((node.y + travelNode.y) / 2 * NODE_AREA + offsetY),
                            },
                            length: Math.round(
                                Math.sqrt(
                                    Math.pow(Math.abs(node.x - travelNode.x), 2) +
                                    Math.pow(Math.abs(node.y - travelNode.y), 2)
                                ) * (NODE_AREA) - 25
                            ),
                            angle: Math.atan2(
                                node.y - travelNode.y,
                                node.x - travelNode.x
                            )
                        };
                    });
                });

                return Object.values(paths);
            });
        const mapOffsetStream = nodeTokensStream
            .map(nodes => nodes.find(node => node.currentLocation))
            .do(position => (this.mapOffset = {
                ...position,
            }));
        const backgroundOffsetStream = boxStream
            .map(box => ({
                x: -1070 - this.box.left * NODE_AREA + NODE_AREA / 2,
                y: -1170 - this.box.top * NODE_AREA + NODE_AREA / 2,
            }));
        return {
            data: mapDataStream,
            box: boxStream,
            size: sizeStream,
            nodeTokens: nodeTokensStream,
            mapCenterOffset: mapOffsetStream,
            paths: pathsStream,
            backgroundOffset: backgroundOffsetStream,
            player: ServerService.getMainStream().pluck('creature'),
        };
    },

    created () {
    },

    methods: {
        nodeClicked(node) {
            if (this.data) {
                ContextMenu.open(node.name, node);
            }
        },
        toggleExpand() {
            this.expanded = !this.expanded;
        },
        startDrag(event) {
            this.dragging = {
                x: this.mapOffset.x,
                y: this.mapOffset.y,
            };
        },
        drag(event) {
            this.mapOffset.x = parseInt(this.dragging.x, 10) - event.deltaX;
            this.mapOffset.y = parseInt(this.dragging.y, 10) - event.deltaY;

            this.mapOffset.x = Math.max(this.mapOffset.x, NODE_AREA / 2);
            this.mapOffset.y = Math.max(this.mapOffset.y, NODE_AREA / 2);

            this.mapOffset.x = Math.min(this.mapOffset.x, (this.box.right - this.box.left) * NODE_AREA + NODE_AREA / 2);
            this.mapOffset.y = Math.min(this.mapOffset.y, (this.box.bottom - this.box.top) * NODE_AREA + NODE_AREA / 2);
        },
    },

    template: `
<div>
    <v-touch
        class="main-map-container"
        :class="{ sneaking: player.sneaking, expanded: expanded }"
        @panstart="startDrag"
        @panmove="drag"
        @panend="dragging = false;"
    >
        <div @click="toggleExpand" class="toggle-expand"></div>
        <div
            v-if="size"
            class="draggable-map"
            :class="{ dragging: dragging }"
            :style="{ width: size.width + 'px', height: size.height + 'px', 'margin-top': -mapOffset.y + 'px', 'margin-left': -mapOffset.x + 'px', 'background-position': (backgroundOffset.x) + 'px ' + (backgroundOffset.y) + 'px' }"
        >
            <radial-progress
                v-for="nodeToken in nodeTokens"
                class="node-token"
                :class="{ current: nodeToken.currentLocation }"
                :percentage="100 * (nodeToken.mapping || 0) / 5"
                :size="20"
                @click="nodeClicked(nodeToken);"
                :style="{ left: nodeToken.x + 'px', top: nodeToken.y + 'px' }"
            ></radial-progress>
            <div
                v-for="path in paths"
                class="path"
                :style="{ left: path.position.x + 'px', top: path.position.y + 'px', width: path.length + 'px', 'margin-left': (-path.length / 2) + 'px', transform: 'rotate(' + path.angle + 'rad)' }"
            ></div>
        </div>
    </v-touch>
</div>
    `,
});