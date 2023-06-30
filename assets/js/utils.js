const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function getRandomGenome() {
    let genome = []
    for (let i = 0; i < ticks; i++) {
        num = Math.floor(Math.random() * 4);
        move = 'x'
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
        genome.push(move)
    }
    return genome;
}

function pxToGrid(x, y, scale) {
    var grid_x = Math.floor(x / scale);
    var grid_y = Math.floor(y / scale);
    return [grid_x, grid_y];
}

function getCursorPosition(c, event) {
    const rect = c.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return [x, y]
}

function mutate(agent, mutation_chance) {
    for (let i = 0; i < agent.genome.length; i++) {
        if (Math.random() < mutation_chance) {
            num = Math.floor(Math.random() * 4);
            move = 'x'
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

function get_random_agents(n) {
    a = [];
    for (let i = 0; i < n; i++) {
        a.push(new Agent(
            Math.floor(Math.random() * grid_count),
            Math.floor(Math.random() * grid_count),
            getRandomGenome()
        ))
    }
    return a
}