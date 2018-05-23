import {ServerService} from '../../services/server.js';
import {ContextMenu} from '../generic/context-menu.js';
import '../generic/toast-notification.js';
import '../generic/number-selector.js';
import '../generic/modal.js';
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
        },
        small: {
            type: Boolean,
            default: false,
        }
    },

    methods: {
        onClick(event) {
            this.$emit('click', event);
        }
    },

    template: `
<div class="item-icon" :class="{ small: small }" @click="onClick">
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
            if (this.data) {
                ContextMenu.open(this.data.name, this.data);
            }
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
        resourceSize: {
            1: 'scarce',
            2: 'ample',
            3: 'abundant',
        }
    }),

    subscriptions() {
        const stream = ServerService.getMainStream();
        return {
            player: stream.pluck('creature'),
            node: stream.pluck('node'),
            enemies: stream.pluck('node').pluck('creatures').map(creatures => creatures.filter(c => c.hostile)),
            friendlies: stream.pluck('node').pluck('creatures').map(creatures => creatures.filter(c => !c.hostile)),
            enemiesPresent: stream
                .map(({ node }) => {
                    return node.creatures
                        .some(c => c.hostile && c.status.health);
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
        },

        researchMatsSlots() {
            const none = {
                item: null,
                qty: 1,
            };
            const mats = Array.apply(null, Array(4)).map(() => none);
            Object
                .keys(this.player.researchMaterials)
                .forEach(material => mats[material] = this.player.researchMaterials[material]);
            return mats;
        },

        availableResearchMaterials() {
            const mats = {};
            this.player.inventory.forEach(item => {
                if (mats[item.name]) {
                    mats[item.name].qty += item.qty;
                } else {
                    mats[item.name] = {
                        ...item,
                        integrity: 100,
                    };
                }
            });
            return mats;
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
        <meter-orb color="magenta" :value="player.status.actionProgress" :only-growing="true"/>
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
            <div>Action <meter-orb color="magenta" :value="player.status.actionProgress" :only-growing="true"/></div>
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
            <section>
                <header>Craft</header>
                <div v-for="recipe in player.recipes" class="tech-recipe">
                    <div class="main-icon">
                        <item-icon :src="recipe.icon"></item-icon>
                    </div>
                    <div class="details">
                        <div class="label">
                            {{recipe.name}}
                        </div>
                        <div class="item-list">
                            <item-icon v-for="material in recipe.materials" :key="material.item.name" :src="material.item.icon" :qty="material.qty" :small="true"></item-icon>
                            <actions
                                :target="recipe" 
                            />
                        </div>
                    </div>
                </div>
            </section>
            <section>
                <header>Build</header>
                <div v-for="plan in player.buildingPlans" class="tech-recipe">
                    <div class="main-icon">
                        <item-icon :src="plan.icon"></item-icon>
                    </div>
                    <div class="details">
                        <div class="label">
                            {{plan.name}}
                        </div>
                        <div class="item-list">
                            <item-icon v-for="material in plan.materials" :key="material.item.name" :src="material.item.icon" :qty="material.qty" :small="true"></item-icon>
                            <actions
                                :target="plan" 
                            />
                        </div>
                    </div>
                </div>
            </section>
            <section>
                <header>Discover</header>
                <div v-for="(material, idx) in researchMatsSlots" v-if="material" class="research-material">
                    <item-icon @click="selectResearchMaterialIdx = idx;" :src="material.item && material.item.icon"></item-icon>
                    <number-selector v-model="material.qty" @input="updateResearchMats" :min="1" :max="5"></number-selector>
                </div>
                <actions
                    :target="player"
                    name="Research" 
                />
                <modal v-if="selectResearchMaterialIdx !== null" @close="selectResearchMaterialIdx = null">
                    <div class="item-list">
                        <item-icon @click="selectResearchMaterial(null)"></item-icon>
                        <item-icon v-for="item in availableResearchMaterials":key="item.name"  @click="selectResearchMaterial(item)" :src="item.icon" :qty="item.qty"></item-icon>
                    </div>
                </modal>
                <header class="subheader">Recent researches</header>
                <div v-for="attempt in player.recentResearches" class="tech-recipe">
                    <div class="main-icon">
                        <item-icon v-if="attempt.result" :src="attempt.result.icon"></item-icon>
                        <item-icon v-else-if="attempt.rightIngredients" src="images/icon-question.png"></item-icon>
                        <item-icon v-else src="images/icon-cross.png"></item-icon>
                    </div>
                    <div class="details">
                        <div v-if="attempt.result" class="label">
                            New recipe: {{attempt.result.name}}!
                        </div>
                        <div v-else-if="attempt.rightIngredients" class="label">
                            Matching quantities: {{attempt.matchingCounts}} / {{attempt.matchesNeeded}}
                        </div>
                        <div v-else class="label">
                            Doesn't seem to work
                        </div>
                        <div class="item-list">
                            <item-icon v-for="material in attempt.materialsUsed" :key="material.item.name" :src="material.item.icon" :qty="material.qty" :small="true"></item-icon>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        <div :hidden="mode !== 'location'">
            <actions
                :target="player"
                name="Search" 
            />
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
                    {{resource.name}} ({{resourceSize[resource.size]}})
                    <actions
                        :target="resource"
                    />
                </div>
            </section>
        </div>
        <div :hidden="mode !== 'mobs'">
            <actions
                :target="player"
                name="Fight" 
            />
            <section>
                <header>Enemies</header>
                <div v-for="creature in enemies" class="creature">
                    <span class="name">{{creature.name}}</span>
                    <meter-orb color="red" :value="creature.status.health"/><br/>
                    <actions
                        :target="creature"
                    />
                </div>
            </section>
            <section>
                <header>Friendlies</header>
                <div v-for="creature in friendlies" class="creature">
                    <span class="name">{{creature.name}}</span>
                    <meter-orb color="red" :value="creature.status.health"/><br/>
                    <actions
                        :target="creature"
                    />
                </div>
            </section>
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
            @click="mode = 'stats'"
            :class="{ active: mode === 'stats' }"
        >S</div>
    </div>
    <context-menu></context-menu>
    <toast-notification></toast-notification>
</div>
`,
};
