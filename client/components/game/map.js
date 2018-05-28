import {MapService} from '../../services/map.js'
import {ServerService} from '../../services/server.js';
import {ContextMenu} from '../generic/context-menu.js';
import './actions.js';
import '../generic/radial-progress.js';

const NODE_AREA = 50;

Vue.component('world-map', {
    data: () => ({
        NODE_AREA,
        dragging: false,
        expanded: false,
        mapOffset: null,
    }),

    subscriptions() {
        const mapDataStream = MapService.getMapStream();
        const playerStream = ServerService.getMainStream().pluck('creature');
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
                width: (box.right - box.left + 1),
                height: (box.bottom - box.top + 1),
            }));
        const nodeTokensStream = Rx.Observable
            .combineLatest([
                nodesStream,
                boxStream,
                playerStream,
            ])
            .map(([ nodes, box, player ]) => {
                const offsetX = -box.left;
                const offsetY = -box.top;
                return nodes.map(node => ({
                    ...node,
                    highlight: player.travelQueue[player.travelQueue.length - 1] === node.id,
                    x: node.x + offsetX,
                    y: node.y + offsetY,
                }));
            });
        const pathsStream = Rx.Observable
            .combineLatest([
                mapDataStream,
                boxStream,
                playerStream,
            ])
            .map(([ nodes, box, player ]) => {
                const paths = {};
                const offsetX = -box.left;
                const offsetY = -box.top;
                console.log(player.travelQueue);

                nodes.forEach(node => {
                    node.paths.forEach(travelNode => {
                        let lowerId = Math.min(node.id, travelNode.id);
                        let higherId = Math.max(node.id, travelNode.id);
                        let highlight = false;

                        if (
                            (travelNode.currentLocation || player.travelQueue.includes(travelNode.id)) &&
                            (node.currentLocation || player.travelQueue.includes(node.id))
                        ) {
                            highlight = true;
                        }

                        paths[`${lowerId}-${higherId}`] = {
                            highlight,
                            position: {
                                x: Math.round((node.x + travelNode.x) / 2 + offsetX),
                                y: Math.round((node.y + travelNode.y) / 2 + offsetY),
                            },
                            length: Math.round(
                                Math.sqrt(
                                    Math.pow(Math.abs(node.x - travelNode.x), 2) +
                                    Math.pow(Math.abs(node.y - travelNode.y), 2)
                                )  - 25
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
            .do(position => (this.mapOffset === null ? this.mapOffset = {
                ...position,
            } : position));
        return {
            data: mapDataStream,
            box: boxStream,
            size: sizeStream,
            nodeTokens: nodeTokensStream,
            mapCenterOffset: mapOffsetStream,
            paths: pathsStream,
            player: playerStream,
        };
    },

    created () {
    },

    methods: {
        nodeClicked(node) {
            if (this.data) {
                const resourcesHtml = (node.resources || []).map(resource => {
                    return `<div>${resource.name} (${RESOURCE_SIZES[resource.size]})<div>`;
                }).join('');
                ContextMenu.open(node.name, node, resourcesHtml);
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
        <button @click="toggleExpand" class="toggle-expand">
            <div class="icon"></div>
        </button>
        <div
            v-if="size"
            class="draggable-map"
            :class="{ dragging: dragging }"
            :style="{ width: size.width + 'px', height: size.height + 'px', 'margin-top': -mapOffset.y + 'px', 'margin-left': -mapOffset.x + 'px' }"
        >
            <div
                v-for="nodeToken in nodeTokens"
                class="node-token background"
                :style="{ left: nodeToken.x + 'px', top: nodeToken.y + 'px' }"
                v-if="nodeToken.mapping"
            >
                <img class="map-image" :src="'/mapImage/' + nodeToken.id">
            </div>
            <div
                v-for="nodeToken in nodeTokens"
                class="node-token"
                :style="{ left: nodeToken.x + 'px', top: nodeToken.y + 'px' }"
            >
                <radial-progress
                    :key="nodeToken.id"
                    :class="{ current: nodeToken.currentLocation, highlight: nodeToken.highlight }"
                    :percentage="100 * (nodeToken.mapping || 0) / 5"
                    :size="20"
                    @click="nodeClicked(nodeToken);"
                >
                </radial-progress>
            </div>
            <div
                v-for="path in paths"
                class="path"
                :class="{ highlight: path.highlight }"
                :style="{ left: path.position.x + 'px', top: path.position.y + 'px', width: path.length + 'px', 'margin-left': (-path.length / 2) + 'px', transform: 'rotate(' + path.angle + 'rad)' }"
            >{{path.id}}</div>
        </div>
    </v-touch>
</div>
    `,
});