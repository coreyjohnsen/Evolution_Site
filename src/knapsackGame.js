Array.prototype.max = function() {
    return Math.max.apply(null, this);
};

Array.prototype.min = function() {
    return Math.min.apply(null, this);
};

var items = [];
var maxValue = 0;
var id = 0;

max_generations = 1000;
candidates_per_generation = 100;
keep_from_prev = 5;
children = candidates_per_generation - keep_from_prev;
mutation_chance = 0.1;
print_every = 100;
initial_pickup_chance = 0.1;

knapsack_capacity = 100;

function addKnapsackItem(getValuesFromInputs) {
    for (let item of items) {
        document.getElementById(item.id).className = 'knapsackItem';
    }
    if (getValuesFromInputs) {
        var weight = Number(document.getElementById('knapsackWeight').value);
        var value = Number(document.getElementById('knapsackValue').value);
    } else {
        var weight = getRandomInt(1, 10);
        var value = getRandomInt(1, 10);
    }
    
    var element = document.createElement('div');
    element.className = 'knapsackItem';
    element.innerHTML = `Weight: ${weight}<br>Value: ${value}`
    var elementId = `item_${id++}`;
    element.id = elementId;
    element.onclick = () => removeKnapsackItem(element);
    var list = document.getElementById('itemList');
    list.appendChild(element);
    var obj = {weight: weight, value: value, id: elementId};
    items.push(obj);
    maxValue = 0;
    for(let item of items) {
        maxValue += item.value;
    }
}

function removeKnapsackItem(item) {
    for (let item of items) {
        document.getElementById(item.id).className = 'knapsackItem';
    }
    var removeId = item.id;
    items.splice(items.indexOf(items.find(i => i.id === removeId)), 1);
    item.remove();
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; 
}

function initRandomGeneration() {
    var generation = [];
    for (let i = 0; i < candidates_per_generation; i++) {
        var genome = [];
        for (let j = 0; j < items.length; j++) {
            genome.push(Math.random() < initial_pickup_chance ? 1 : 0);
        }
        generation.push(genome)
    }
    return generation;
}

function fitnessFunction(genome) {
    var fitness = 0;
    var weight = 0;
    for (let i in genome) {
        fitness += genome[i] == 1 ? items[i].value : 0;
        weight += genome[i] == 1 ? items[i].weight : 0;
    }
    return weight > knapsack_capacity ? -1 : fitness;
}

function getSurvived(generation) {
    var survived = [];
    for (let genome of generation) {
        if (fitnessFunction(genome) != -1) survived.push(genome)
    }
    return survived;
}

function mutate(childList) {
    var newList = [];
    for (let genome of childList) {
        var newGenome = [];
        for (let gene of genome) {
            if (Math.random() < mutation_chance)
                newGenome.push(gene == 1 ? 0 : 1);
            else newGenome.push(gene);
        }
        newList.push(newGenome);
    }
    return newList;
}

function makeChildren(survived) {
    var fitnesses = [];
    for (let genome of survived) {
        fitnesses.push(fitnessFunction(genome));
    }
    var drawFrom = [];
    for (let i in fitnesses) {
        for (let j = 0; j < fitnesses[i]; j++) {
            drawFrom.push(i);
        }
    }
    var childList = [];
    for (let i = 0; i < children; i++) {
        var pIndex = getRandomInt(0, drawFrom.length - 2);
        var parent1 = survived[drawFrom[pIndex]];
        var parent2 = survived[drawFrom[pIndex+1]];
        var splitPoint = getRandomInt(0, parent1.length - 1);
        var child = parent1.slice(0, splitPoint).concat(parent2.slice(splitPoint));
        childList.push(child);
    }
    childList = mutate(childList);
    return childList;
}

function getFittest(survived) {
    var fittest = [];
    for (let i = 0; i < keep_from_prev; i++) {
        fittest.push([-1, -1]);
    }
    for (let i in survived) {
        for (let j in fittest) {
            if (fitnessFunction(survived[i]) > fittest[j][0]) {
                fittest[j] = [fitnessFunction(survived[i]), i];
                break;
            }
        }
    }
    var ret = [];
    for (let f of fittest) {
        ret.push(survived[f[1]]);
    }
    return ret;
}

function generationFitness(generation) {
    var res = []
    for (let genome of generation) {
        res.push(fitnessFunction(genome));
    }
    return res;
}

function startKnapsackSimulation() {
    for (let item of items) {
        document.getElementById(item.id).className = 'knapsackItem';
    }

    var out = document.getElementById('knapsackOutput');
    out.value = "";
    out.value += "Starting simulation..."
    var gen = initRandomGeneration()
    for (let generation = 0; generation < max_generations; generation++) {
        let survived = getSurvived(gen)
        if (survived.length == 0) {
            out.value += `\nGeneration ${generation}: all genomes failed to survive`
            return;
        }
        let newGen = getFittest(survived).concat(makeChildren(survived))
        gen = newGen
        if (generation % print_every == 0) {
            out.value += `\n-----------------------------------------------------------------------------------------------------------------`
            out.value += `\nGeneration ${generation}: best fitness is ${generationFitness(gen).max()} of ${maxValue} total possible points.`
            out.value += `\nGeneration ${generation}: ${survived.length} genomes survived. Worst fitness was ${generationFitness(gen).min()}.`
        }  
    }
    keep_from_prev = 1
    var best = getFittest(gen)[0]
    out.value += `\n-----------------------------------------------------------------------------------------------------------------`
    out.value += `\nBest solution found is: ${best}`

    for(let i = 0; i < items.length; i++) {
        if(best[i] == 1) {
            var item = document.getElementById(items[i].id);
            item.className = 'selected'
        }
    }
}

function randomizeItems() {
    for (let item of items) {
        document.getElementById(item.id).remove();
    }
    items = [];
    for (let i = 0; i < 50; i++) {
        addKnapsackItem(false);
    }
}

const setMaxWeight = (weight) => knapsack_capacity = Number(weight)
const setKnapsackGens = (gens) => max_generations = Number(gens);
const setKnapsackMutation = (chance) => mutation_chance = Number(chance)
