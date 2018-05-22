import {ServerService} from '../../services/server.js';
import {ContextMenu} from '../generic/context-menu.js';
import {ToastNotification} from '../generic/toast-notification.js';
import '../game/map.js';
import '../game/actions.js';

const skillLevels = {
    0: 'Dabbling',
    1: 'Novice',
    2: 'Competent',
    3: 'Proficient',
    4: 'Professional',
    5: 'Accomplished',
    6: 'Expert',
    7: 'Master',
    8: 'Grand Master',
    9: 'Legendary',
};

const skillNames = {
    1: 'Carpentry',
    2: 'Foraging',
    3: 'Mining',
    4: 'Smithing',
    5: 'Fighting',
    6: 'Ranged',
    7: 'Woodcutting',
    8: 'Scouting',
    9: 'Cooking',
    10: 'Crafting',
};

Vue.component('meter-orb', {
    props: [
        'color',
        'value',
        'onlyGrowing'
    ],

    data: () => ({
        reseter: false,
    }),

    watch: {
        value(to, from) {
            if (from > to && this.onlyGrowing) {
                this.reseter = !this.reseter;
            }
        }
    },

    template: `
<span class="meter-orb">
    <div
        :key="reseter"
        class="fill"
        :style="{ 'background-color': color, 'clip-path': 'inset(' + (100 - (value || 0)) + '% 0 0)' }"
    ></div>
</span>
    `,
});

Vue.component('meter-bar', {
    props: [
        'color',
        'value',
        'onlyGrowing'
    ],

    data: () => ({
        reseter: false,
    }),

    watch: {
        value(to, from) {
            if (from > to && this.onlyGrowing) {
                this.reseter = !this.reseter;
            }
        }
    },

    template: `
<span class="meter-bar">
    <div
        :key="reseter"
        class="fill"
        :style="{ 'background-color': color, width: (value || 0) + '%' }"
    ></div>
</span>
    `,
});

Vue.component('item-icon', {
    props: {
        src: String,
        qty: {
            type: Number,
            default: 1,
        },
        integrity: {
            type: Number,
            default: 100,
        }
    },

    methods: {
        onClick(event) {
            this.$emit('click', event);
        }
    },

    template: `
<div class="item-icon" @click="onClick">
    <div class="slot">
        <img :src="src" v-if="src">
        <span class="qty" v-if="qty && qty > 1">{{qty}}</span>
        <span class="integrity" v-if="integrity && integrity < 100">{{integrity}}%</span>
    </div>
</div>
    `,
});

Vue.component('item', {
    props: [
        'data',
    ],

    methods: {
        contextMenu() {
            ContextMenu.open(this.data.name, this.data);
        }
    },

    template: `
<item-icon :src="data && data.icon" :qty="data && data.qty" :integrity="data && data.integrity" @click="contextMenu();"></item-icon>
    `,
});

export const MainView = {
    data: () => ({
        mode: 'location',
        selectResearchMaterialIdx: null,
        skillLevels,
        skillNames,
    }),

    subscriptions() {
        const stream = ServerService.getMainStream();
        return {
            player: stream.pluck('creature'),
            node: stream.pluck('node'),
            enemiesPresent: stream
                .map(({ node }) => {
                    return node.creatures
                        .some(c => c.hostile);
                }),
        };
    },

    created () {
    },

    computed: {
        emptySlots() {
            // TODO: stop hard-coding
            const length = Math.max(10 - this.player.inventory.length, 0);
            return new Array(length);
        }
    },

    methods: {
        updateResearchMats() {
            const payload = {};
            this.player.researchMaterials
                .forEach(mats => {
                    payload[mats.item.itemCode] = +mats.qty;
                });
            ServerService.request('updateResearchMaterials', payload);
        },

        toggleBehaviour() {
            ServerService.request('updateBehaviour', {
                passive: !this.player.behaviour.passive,
            });
        },

        selectResearchMaterial(item) {
            if (item === null) {
                delete this.player.researchMaterials[this.selectResearchMaterialIdx];
            } else {
                if (this.player.researchMaterials[this.selectResearchMaterialIdx]) {
                    this.player.researchMaterials[this.selectResearchMaterialIdx].item = item;
                } else {
                    this.player.researchMaterials[this.selectResearchMaterialIdx] = {
                        item,
                        qty: 1,
                    }
                }
            }
            this.selectResearchMaterialIdx = null;
            this.updateResearchMats();
        }
    },

    template: `
<div v-if="player && node" class="main-container">
    <world-map class="world-map-container"></world-map>
    <div class="status-bar">
        <meter-orb color="red" :value="player.status.health"/>
        <meter-orb color="limegreen" :value="player.status.stamina"/>
        <meter-orb color="dodgerblue" :value="player.status.energy"/>
        <meter-orb color="orange" :value="player.status.satiated"/>
        <meter-orb color="gray" :value="player.status.stealth"/>
        <meter-orb color="purple" :value="player.status.mood"/>
    </div>
    <div class="scrollable-contents">
        <div :hidden="mode !== 'stats'">
            Behaviour: <button @click="toggleBehaviour()" class="action">{{player.behaviour.passive ? 'Passive' : 'Defensive'}}</button>
            <actions
                :target="player" 
            />
            Name: {{player.name}}<br/>
            <!--Action: <meter-bar color="magenta" :value="player.status.actionProgress" :only-growing="true"/><br/>-->
            <div>Health <meter-orb color="red" :value="player.status.health"/></div>
            <div>Stamina <meter-orb color="limegreen" :value="player.status.stamina"/></div>
            <div>Energy <meter-orb color="dodgerblue" :value="player.status.energy"/></div>
            <div>Satiated <meter-orb color="orange" :value="player.status.satiated"/></div>
            <div>Stealth <meter-orb color="gray" :value="player.status.stealth"/></div>
            <div>Mood <meter-orb color="purple" :value="player.status.mood"/></div>
            <hr/>
            <div v-for="skill in player.skills">
                {{skillNames[skill.id]}}: {{skillLevels[skill.level]}}
            </div>
        </div>
        <div :hidden="mode !== 'inventory'">
            <section>
                <header>Equipment</header>
                <div class="equipment-list">
                    <div class="equipment tool">
                        <span class="slot">Tool</span>
                        <item :data="player.tool"></item>
                    </div>
                    <div class="equipment weapon">
                        <span class="slot">Weapon</span>
                        <item :data="player.weapon"></item>
                    </div>
                </div>
            </section>
            <section>
                <header>Inventory</header>
                <div class="item-list">
                    <item v-for="item in player.inventory" :data="item" :key="item.id"></item>
                    <item-icon v-for="(emptySlot, idx) in emptySlots" :key="idx"></item-icon>
                </div>
            </section>
            <section v-for="structure in node.structures" v-if="structure.inventory">
                <header>Storage</header>
                <div class="item-list">
                    <item v-for="item in structure.inventory" :data="item" :key="item.id"></item>
                </div>
            </section>
            <section v-if="node.inventory && node.inventory.length">
                <header>On the ground</header>
                <div class="item-list">
                    <item v-for="item in node.inventory" :data="item" :key="item.id"></item>
                </div>
            </section>
        </div>
        <div :hidden="mode !== 'crafting'">
            <div v-for="recipe in player.recipes">
                {{recipe.name}}<br/>
                Materials: <div v-for="(qty, name) in recipe.materials">{{name}} ({{qty}})</div>
                <actions
                    :target="recipe" 
                />
            </div>
            <div v-for="plan in player.buildingPlans">
                {{plan.name}}<br/>
                Materials: <div v-for="(qty, name) in plan.materials">{{name}} ({{qty}})</div>
                <actions
                    :target="plan" 
                />
            </div>
        </div>
        <div :hidden="mode !== 'location'">
            <section>
                <header>Structures</header>
                <div v-for="structure in node.structures">
                    {{structure.name}}
                    <actions
                        :target="structure"
                    />
                </div>
            </section>
            <section>
                <header>Resources</header>
                <div v-for="resource in node.resources">
                    {{resource.name}}
                    <actions
                        :target="resource"
                    />
                </div>
            </section>
        </div>
        <div :hidden="mode !== 'mobs'">
            <div v-for="creature in node.creatures">
                {{creature.name}}
                <meter-bar color="red" :value="creature.status.health"/><br/>
                <actions
                    :target="creature"
                />
            </div>
        </div>
        <div :hidden="mode !== 'discovery'">
            <div v-for="(material, idx) in player.researchMaterials" v-if="material">
                <span @click="selectResearchMaterialIdx = idx;">{{material.item.name}}</span>
                <input type="number" v-model="material.qty" @input="updateResearchMats">
            </div>
            <div
                v-if="player.researchMaterials.length < 4"
                @click="selectResearchMaterialIdx = player.researchMaterials.length;"
            >
                +
            </div>
            <div v-if="selectResearchMaterialIdx !== null">
                <div @click="selectResearchMaterial(null)">null</div>
                <div v-for="item in player.inventory" @click="selectResearchMaterial(item)">
                    {{item.name}} <span v-if="item.qty > 1">({{item.qty}})</span>
                </div>
            </div>
            <hr/>
            <div v-for="attempt in player.recentResearches">
                <div v-for="item in attempt.materialsUsed">
                    {{item.item.name}} ({{item.qty}})
                </div>
                <div v-if="attempt.rightIngredients">
                    {{attempt.matchingCounts}} / {{attempt.matchesNeeded}}
                </div>
                <div v-if="attempt.result">
                    Result: {{attempt.result.name}}
                </div>
                <hr/>
            </div>
        </div>
    </div>
    <div class="section-selector">
        <div
            class="toggle"
            @click="mode = 'location'"
            :class="{ active: mode === 'location' }"
        >L</div>
        <div
            class="toggle"
            @click="mode = 'mobs'"
            :class="{ active: mode === 'mobs', highlight: enemiesPresent }"
        >M</div>
        <div
            class="toggle"
            @click="mode = 'inventory'"
            :class="{ active: mode === 'inventory' }"
        >I</div>
        <div
            class="toggle"
            @click="mode = 'crafting'"
            :class="{ active: mode === 'crafting' }"
        >C</div>
        <div
            class="toggle"
            @click="mode = 'discovery'"
            :class="{ active: mode === 'discovery' }"
        >D</div>
        <div
            class="toggle"
            @click="mode = 'stats'"
            :class="{ active: mode === 'stats' }"
        >S</div>
    </div>
    <context-menu></context-menu>
    <toast-notification></toast-notification>
</div>
`,
};
