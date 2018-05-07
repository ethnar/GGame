import {MapService} from '../../services/map.js'
import './actions.js';

Vue.component('world-map', {
    data: () => ({
        contextMenuNode: null,
    }),

    subscriptions() {
        const NODE_SIZE = 40;
        const NODE_AREA = 100;

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
                width: (box.right - box.left + 1) * NODE_AREA + 'px',
                height: (box.bottom - box.top + 1) * NODE_AREA + 'px',
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
                    x: node.x * NODE_AREA + offsetX + 'px',
                    y: node.y * NODE_AREA + offsetY + 'px',
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
                                x: (node.x + travelNode.x) / 2 * NODE_AREA + offsetX + 'px',
                                y: (node.y + travelNode.y) / 2 * NODE_AREA + offsetY + 'px',
                            },
                            length: Math.sqrt(
                                Math.pow(Math.abs(node.x - travelNode.x), 2) +
                                Math.pow(Math.abs(node.y - travelNode.y), 2)
                            ) * NODE_AREA,
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
            .map(nodes => nodes.find(node => node.currentLocation));
        return {
            data: mapDataStream,
            box: boxStream,
            size: sizeStream,
            nodeTokens: nodeTokensStream,
            mapOffset: mapOffsetStream,
            paths: pathsStream,
        };
    },

    created () {
    },

    methods: {
        nodeClicked(node) {
            this.contextMenuNode = node;
        }
    },

    template: `
<div>
    <!--{{data}}-->
    <div class="container">
        <div
            v-if="size"
            class="draggable-map"
            :style="{ width: size.width, height: size.height, 'margin-top': '-' + mapOffset.y, 'margin-left': '-' + mapOffset.x}"
        >
            <div
                v-for="nodeToken in nodeTokens"
                class="node-token"
                :class="{ current: nodeToken.currentLocation }"
                @click="nodeClicked(nodeToken);"
                :style="{ left: nodeToken.x, top: nodeToken.y }"
            ></div>
            <div
                v-for="path in paths"
                class="path"
                :style="{ left: path.position.x, top: path.position.y, width: path.length + 'px', 'margin-left': (-path.length / 2) + 'px', transform: 'rotate(' + path.angle + 'rad)' }"
            ></div>
        </div>
    </div>
    <div v-if="contextMenuNode" @click="contextMenuNode = null">
        Actions:
        <actions :target="contextMenuNode"></actions>
    </div>
</div>
    `,
});