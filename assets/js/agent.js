class Agent {
    constructor(x, y, genome) {
        this.x = x;
        this.y = y;
        this.genome = genome;
    }

    runTick(tick) {
        this.move(this.genome[tick]);
    }

    move(dir) {
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
}