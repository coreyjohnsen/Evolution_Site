class Agent {

    constructor(x, y, genome) {
        this.x = x;
        this.y = y;
        this.genome = genome;
        this.reward = Infinity;
    }

    runTick(tick, grid, grid_count) {
        this.move(this.genome[tick], grid, grid_count);
    }

    move(dir, grid, grid_count) {
        switch (dir) {
            case 'u':
                if (this.y > 0 && grid[this.x][this.y - 1] != 1)
                    this.y -= 1;
                break;
            case 'd':
                if (this.y < grid_count - 1 && grid[this.x][this.y + 1] != 1)
                    this.y += 1;
                break;
            case 'r':
                if (this.x < grid_count - 1 && grid[this.x + 1][this.y] != 1)
                    this.x += 1;
                break;
            case 'l':
                if (this.x > 0 && grid[this.x - 1][this.y] != 1)
                    this.x -= 1;
                break;
        }
    }

    evalReward(agent_goal) {
        this.reward = Math.abs(agent_goal.x - this.x) + Math.abs(agent_goal.y - this.y)
    }

    static makeNewGeneration(s, startPos, agentsPerGen, survivedPerGen, mutationChance) {
        var newGen = [];
        for (let a of s) newGen.push(a);
        let children = Agent.reproduce(s, agentsPerGen - survivedPerGen, mutationChance);
        newGen = newGen.concat(children);
        for (let a of newGen) {
            a.x = startPos.x
            a.y = startPos.y
        };
        return newGen;
    }

    static reproduce(s, new_agents, mutationChance) {
        var ret = []
        for (let i = 0; i < new_agents; i++) {
            if (Math.random() < 0.5) {
                // mutate copy of a surviving agent
                var copy = JSON.parse(JSON.stringify(s.sort(() => 0.5 - Math.random())[0]));
                copy = new Agent(copy.x, copy.y, copy.genome);
                ret.push( copy );
            } else {
                // breed two parents and mutate child
                const shuffled = s.sort(() => 0.5 - Math.random());
                let selected = shuffled.slice(0, 2);
                let split_index = Math.floor(Math.random() * selected[0].genome.length);
                var new_agent = selected[0].genome.slice(0, split_index)
                    .concat(selected[1].genome.slice(split_index, selected[1].genome.length))
                ret.push(new Agent(0, 0, new_agent))
            } 
        }
        for (let a of ret) {
            Agent.mutate(a, mutationChance)
        }
        return ret
    }

    static mutate(agent, mutationChance) {
        for (let i = 0; i < agent.genome.length; i++) {
            if (Math.random() < mutationChance) {
                var num = Math.floor(Math.random() * 4);
                var move = 'x'
                switch (num) {
                    case 0:
                        move = 'u'
                        break;
                    case 1:
                        move = 'd'
                        break;
                    case 2:
                        move = 'l'
                        break;
                    case 3:
                        move = 'r'
                        break;
                }
                agent.genome[i] = move
            }
        }
    }
}

class NNAgent extends Agent {
    constructor(x, y, network) {
        super(x, y, network); // genome is Network with 12 inputs and 4 outputs
    }

    runNNTick(grid, goalPos) {
        this.nnMove(grid, goalPos);
    }

    nnMove(grid, goalPos) {
        var inputs = []
        inputs = inputs.concat(this.x);
        inputs = inputs.concat(this.y);
        inputs = inputs.concat(goalPos.x);
        inputs = inputs.concat(goalPos.y);
        var grid_count = grid.length;
        //inputs = inputs.concat(flatten(grid));
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i == 0 && j == 0) continue;
                var res;
                if (grid[this.x + i] == undefined) res = 1;
                else if (grid[this.x + i][this.y + j] == undefined) res = 1;
                else res = grid[this.x + i][this.y + j];
                inputs = inputs.concat(res);
            }
        }
        var output = this.genome.forward(inputs);
        if (output[0] == 1 && this.y > 0 && grid[this.x][this.y - 1] != 1) this.y -= 1; //  up
        if (output[1] == 1 && this.y < grid_count - 1 && grid[this.x][this.y + 1] != 1) this.y += 1; // down
        if (output[2] == 1 && this.x < grid_count - 1 && grid[this.x + 1][this.y] != 1) this.x += 1; // right
        if (output[3] == 1 && this.x > 0 && grid[this.x - 1][this.y] != 1) this.x -= 1; // left
    }

    static makeNewGeneration(s, startPos, agentsPerGen, survivedPerGen, mutationChance) {
        var newGen = [];
        for (let a of s) newGen.push(a);
        let children = NNAgent.reproduce(s, agentsPerGen - survivedPerGen, mutationChance);
        newGen = newGen.concat(children);
        for (let a of newGen) {
            a.x = startPos.x
            a.y = startPos.y
        };
        return newGen;
    }

    static reproduce(s, new_agents, mutationChance) {
        var ret = []
        for (let i = 0; i < new_agents; i++) {
            if (Math.random() < 0.5) {
                // mutate copy of a surviving agent
                var c = new NNAgent(0, 0, new Network([1, 1, 1])); // make this a deep copy
                c.genome.cloneFromNetwork(s.sort(() => 0.5 - Math.random())[0].genome);
                ret.push( c );
            } else {
                // breed two parents and mutate child
                const shuffled = s.sort(() => 0.5 - Math.random());
                let selected = shuffled.slice(0, 2);
                ret.push(new NNAgent(0, 0, Network.reproduce(selected[0].genome, selected[1].genome)))
            } 
        }
        for (let a of ret) {
            NNAgent.mutate(a, mutationChance)
        }
        return ret
    }

    static mutate(agent, mutationChance) {
        agent.genome.mutate(mutationChance);
    }

}