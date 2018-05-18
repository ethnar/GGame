import {ServerService} from '../../services/server.js';
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

Vue.component('meter-bar', {
    props: [
        'color',
        'value',
    ],

    template: `
<span class="meter-bar">
    <div
        class="fill"
        :style="{ 'background-color': color, width: (value || 0) + '%' }"
    ></div>
</span>
    `,
});

export const MainView = {
    data: () => ({
        mode: 'stats',
        selectResearchMaterialIdx: null,
        skillLevels,
        skillNames,
    }),

    subscriptions() {
        const stream = ServerService.getMainStream();
        return {
            player: stream.pluck('creature'),
            node: stream.pluck('node'),
        };
    },

    created () {
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
    <div class="scrollable-contents">
        <div :hidden="mode !== 'stats'">
            <actions
                :target="player" 
            />
            Name: {{player.name}}<br/>
            Action: <meter-bar color="magenta" :value="player.status.actionProgress"/><br/>
            Health: <meter-bar color="red" :value="player.status.health"/><br/>
            Stamina: <meter-bar color="limegreen" :value="player.status.stamina"/><br/>
            Energy: <meter-bar color="dodgerblue" :value="player.status.energy"/><br/>
            Satiated: <meter-bar color="orange" :value="player.status.satiated"/><br/>
            Stealth: <meter-bar color="gray" :value="player.status.stealth"/><br/>
            Mood: <meter-bar color="pink" :value="player.status.mood"/><br/>
            Tool: {{player.tool && player.tool.name}}<br/>
            <div v-for="skill in player.skills">
                {{skillNames[skill.id]}}: {{skillLevels[skill.level]}}
            </div>
        </div>
        <div :hidden="mode !== 'inventory'">
            <div v-for="item in player.inventory">
                {{item.name}} <span v-if="item.qty > 1">({{item.qty}})</span>
                <actions
                    :target="item" 
                />
            </div>
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
        <div :hidden="mode !== 'resources'">
            <div v-for="resource in node.resources">
                {{resource.name}}
                <actions
                    :target="resource"
                />
            </div>
        </div>
        <div :hidden="mode !== 'structure'">
            <div v-for="structure in node.structures">
                {{structure.name}}
                <actions
                    :target="structure"
                />
            </div>
        </div>
        <div :hidden="mode !== 'mobs'">
            <div v-for="creature in node.creatures">
                {{creature.name}}
                <actions
                    :target="creature"
                />
            </div>
        </div>
        <div :hidden="mode !== 'discovery'">
            <div v-for="(material, idx) in player.researchMaterials">
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
            @click="mode = 'stats'"
            :class="{ active: mode === 'stats' }"
        >S</div>
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
            @click="mode = 'resources'"
            :class="{ active: mode === 'resources' }"
        >R</div>
        <div
            class="toggle"
            @click="mode = 'structure'"
            :class="{ active: mode === 'structure' }"
        >B</div>
        <div
            class="toggle"
            @click="mode = 'mobs'"
            :class="{ active: mode === 'mobs' }"
        >M</div>
        <div
            class="toggle"
            @click="mode = 'discovery'"
            :class="{ active: mode === 'discovery' }"
        >D</div>
    </div>
</div>
`,
};
