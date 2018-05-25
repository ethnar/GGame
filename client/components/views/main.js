import {ServerService} from '../../services/server.js';
import {ContextMenu} from '../generic/context-menu.js';
import '../generic/toast-notification.js';
import '../generic/number-selector.js';
import '../generic/modal.js';
import '../game/map.js';
import '../game/actions.js';
import '../game/current-action.js';

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
<span class="meter-orb" @click="$emit('click', $event);">
    <div
        :key="reseter"
        class="fill"
        :style="{ 'background-color': color, 'clip-path': 'inset(' + (100 - (value || 0)) + '% 0 0)' }"
    ></div>
    <div class="border"></div>
</span>
    `,
});

Vue.component('inventory', {
    props: [
        'data',
        'slots',
    ],

    computed: {
        emptySlots() {
            let length = 0;
            if (this.slots && this.data) {
                length = Math.max(this.slots - this.data.length, 0);
            }
            return new Array(length);
        },

        sorted() {
            return this.data.slice(0).sort((a, b) => {
                if (a.name === b.name) {
                    return b.qty - a.qty;
                }
                if (a.name > b.name) {
                    return 1;
                } else {
                    return -1;
                }
            });
        }
    },

    template: `
<div class="item-list">
    <item v-for="(item, idx) in sorted" :data="item" :key="'i' + idx"></item>
    <item-icon v-for="(emptySlot, idx) in emptySlots" :key="idx"></item-icon>
</div>
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

    template: `
<div class="item-icon" :class="{ small: small }" @click="$emit('click', $event)">
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
        researchMatsSlots: [],
        resourceSize: RESOURCE_SIZES,
    }),

    subscriptions() {
        const stream = ServerService.getMainStream();
        return {
            player: stream
                .pluck('creature')
                .do((player) => {
                    this.updateDisplayedMats(player.researchMaterials);
                }),
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
        updateDisplayedMats(researchMaterials) {
            const mats = Array.apply(null, Array(4)).map(() => ({
                item: null,
                qty: 1,
            }));
            Object
                .keys(researchMaterials)
                .forEach(material => mats[material] = researchMaterials[material]);
            this.researchMatsSlots = mats;
        },

        updateResearchMats() {
            const payload = {};
            this.researchMatsSlots
                .filter(mats => mats.item)
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
                this.researchMatsSlots[this.selectResearchMaterialIdx] = {
                    item: null,
                    qty: 1,
                };
            } else {
                if (Object.values(this.researchMatsSlots).every(mats => !mats.item || mats.item.name !== item.name)) {
                    this.researchMatsSlots[this.selectResearchMaterialIdx].item = item;
                }
            }
            this.selectResearchMaterialIdx = null;
            this.updateResearchMats();
        },

        explain(topic) {
            const instructions = {
                health: {
                    name: 'Health',
                    description: 'Represents your health. If it reaches zero your character will die, permanently. Health regenerates very slowly over time.',
                },
                stamina: {
                    name: 'Stamina',
                    description: 'Represents your stamina. Stamina is used when fighting and sneaking.',
                },
                energy: {
                    name: 'Energy',
                    description: 'Represents your energy. Energy slowly drains while you are awake and you need to sleep to regain it.',
                },
                satiated: {
                    name: 'Hunger',
                    description: 'Represents your hunger. When empty your character will loose health over time, instead of regenerating it.',
                },
                stealth: {
                    name: 'Stealth',
                    description: 'The level of stealth of your character. As long as you are in stealth, your character won\'t be attacked by enemies. Attacking immediately breaks stealth.',
                },
                mood: {
                    name: 'Mood',
                    description: 'The mood of your character. Keeping it up enables you to work with much better efficiency, gathering and producting faster as well as fighting better. Mood depends on your health, stamina, energy and hunger level.',
                },
            };

            const instruction = instructions[topic];
            ContextMenu.open(instruction.name, null, `<div class="help-text">${instruction.description}</div>`);
        },
    },

    template: `
<div v-if="player && node" class="main-container">
    <world-map class="world-map-container"></world-map>
    <div class="status-bar">
        <current-action></current-action>
        <div class="spacer"></div>
        <meter-orb color="red" :value="player.status.health" @click="explain('health');"/>
        <meter-orb color="limegreen" :value="player.status.stamina" @click="explain('stamina');"/>
        <meter-orb color="dodgerblue" :value="player.status.energy" @click="explain('energy');"/>
        <meter-orb color="orange" :value="player.status.satiated" @click="explain('satiated');"/>
        <meter-orb color="gray" :value="player.status.stealth" @click="explain('stealth');"/>
        <meter-orb color="purple" :value="player.status.mood" @click="explain('mood');"/>
    </div>
    <div class="scrollable-contents">
        <div :hidden="mode !== 'stats'">
            <section>
                <header>{{player.name}}</header>
                <div class="centered">
                    <button @click="toggleBehaviour()" class="action">{{player.behaviour.passive ? 'Passive' : 'Defensive'}}</button>
                </div>
                <actions
                    class="centered"
                    :target="player"
                    :exclude="['Research', 'Fight', 'Search']" 
                />
            </section>
            <section>
                <header>Skills</header>
                <div v-for="skill in player.skills">
                    {{skillNames[skill.id]}}: {{skillLevels[skill.level]}}
                </div>
            </section>
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
                <inventory :data="player.inventory" :slots="15"></inventory>
            </section>
            <section v-for="structure in node.structures" v-if="structure.inventory">
                <header>Storage</header>
                <inventory :data="structure.inventory" :slots="50"></inventory>
            </section>
            <section v-if="node.inventory && node.inventory.length">
                <header>On the ground</header>
                <inventory :data="node.inventory"></inventory>
            </section>
        </div>
        <div :hidden="mode !== 'crafting'">
            <section>
                <header>Craft</header>
                <div v-for="recipe in player.recipes" class="list-item-with-props">
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
                <div v-for="plan in player.buildingPlans" class="list-item-with-props">
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
                <div class="research-materials">
                    <div v-for="(material, idx) in researchMatsSlots" v-if="material" class="research-material">
                        <item-icon @click="selectResearchMaterialIdx = idx;" :src="material.item && material.item.icon"></item-icon>
                        <number-selector v-model="material.qty" @input="updateResearchMats" :min="1" :max="5"></number-selector>
                    </div>
                </div>
                <actions
                    class="centered"
                    :target="player"
                    name="Research" 
                />
                <modal v-if="selectResearchMaterialIdx !== null" @close="selectResearchMaterialIdx = null">
                    <template slot="main" class="item-list">
                        <item-icon @click="selectResearchMaterial(null)"></item-icon>
                        <item-icon v-for="item in availableResearchMaterials":key="item.name"  @click="selectResearchMaterial(item)" :src="item.icon" :qty="item.qty"></item-icon>
                    </template>
                </modal>
                <header class="subheader">Recent researches</header>
                <div v-for="attempt in player.recentResearches" class="list-item-with-props">
                    <div class="main-icon">
                        <item-icon v-if="attempt.result" :src="attempt.result.icon"></item-icon>
                        <item-icon v-else-if="attempt.rightIngredients" src="images/ui/checkbox_02.png"></item-icon>
                        <item-icon v-else src="images/ui/checkbox_01.png"></item-icon>
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
            <section>
                <header>Structures</header>
                <div v-for="structure in node.structures" class="list-item-with-props">
                    <div class="main-icon">
                        <item-icon :src="structure.icon"></item-icon>
                    </div>
                    <div class="details">
                        <div class="label">
                            {{structure.name}}
                        </div>
                        <div class="item-list">
                            <item-icon v-for="material in structure.materialsNeeded" :key="material.item.name" :src="material.item.icon" :qty="material.qty" :small="true"></item-icon>
                            <actions
                                :target="structure"
                            />
                        </div>
                    </div>
                </div>
            </section>
            <section>
                <header>Resources</header>
                <div v-for="resource in node.resources" class="list-item-with-props">
                    <div class="main-icon">
                        <item-icon :src="resource.icon"></item-icon>
                    </div>
                    <div class="details">
                        <div class="label">
                            {{resource.name}} ({{resourceSize[resource.size]}})
                        </div>
                        <div class="item-list">
                            <!--<item-icon v-for="material in resource.materialsNeeded" :key="material.item.name" :src="material.item.icon" :qty="material.qty" :small="true"></item-icon>-->
                            <actions
                                :target="resource"
                            />
                        </div>
                    </div>
                </div>
                <actions
                    class="centered"
                    :target="player"
                    name="Search" 
                />
            </section>
        </div>
        <div :hidden="mode !== 'mobs'">
            <section>
                <header>Enemies</header>
                <div v-for="creature in enemies" class="creature" :key="creature.id">
                    <span class="name">{{creature.name}}</span>
                    <meter-orb color="red" :value="creature.status.health"/><br/>
                </div>
                <actions
                    class="centered"
                    :target="player"
                    name="Fight" 
                />
            </section>
            <section>
                <header>Friendlies</header>
                <div v-for="creature in friendlies" class="creature" :key="creature.id">
                    <span class="name">{{creature.name}}</span>
                    <meter-orb color="red" :value="creature.status.health"/><br/>
                </div>
            </section>
        </div>
    </div>
    <div class="section-selector">
        <div
            class="toggle location"
            @click="mode = 'location'"
            :class="{ active: mode === 'location' }"
        >
            <div class="shadow"></div>
            <div class="icon"></div>
        </div>
        <div
            class="toggle mobs"
            @click="mode = 'mobs'"
            :class="{ active: mode === 'mobs', highlight: enemiesPresent }"
        >
            <div class="shadow"></div>
            <div class="icon"></div>
        </div>
        <div
            class="toggle inventory"
            @click="mode = 'inventory'"
            :class="{ active: mode === 'inventory' }"
        >
            <div class="shadow"></div>
            <div class="icon"></div>
        </div>
        <div
            class="toggle crafting"
            @click="mode = 'crafting'"
            :class="{ active: mode === 'crafting' }"
        >
            <div class="shadow"></div>
            <div class="icon"></div>
        </div>
        <div
            class="toggle stats"
            @click="mode = 'stats'"
            :class="{ active: mode === 'stats' }"
        >
            <div class="shadow"></div>
            <div class="icon"></div>
        </div>
    </div>
    <context-menu></context-menu>
    <toast-notification></toast-notification>
</div>
`,
};
