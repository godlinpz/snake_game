
window.onload = function()
{
    let game = (new Game({speed: 100, width: 40, height: 40, target: 'snake'}));
    game.run();

    document.addEventListener('keydown', function(event) {
        game.onKey(event.code);
    });
    
}

function random_int(n1, n2)
{
    return n1 + Math.floor(Math.random()*(n2 - n1))
}


class Game {
    constructor(options) {
        // speed, width, height, target
        this.options = options;
        this.map = new GameMap (options);
        this.snake = new Snake (options.speed);

        this.directions = {
            ArrowUp: [0, -1],
            ArrowDown: [0, 1],
            ArrowLeft: [-1, 0],
            ArrowRight: [1, 0],
        }

        this.fruits = ['green', 'blue', 'white'];
    }

    run()
    {
        this.generateFruit();
        this.render();
    }

    generateFruit()
    {
        setTimeout(()=>{
            let fruit = this.fruits[ random_int(0, this.fruits.length) ];

            let cell = this.map.randomEmptyCell();

            cell.setType(fruit);
            cell.render();

            // console.log(cell);

            // this.map.placeFruit(new Cell({type: 'fruit', x: }))      
            this.generateFruit()

         }, random_int(2, 5)*100);        
    }

    onKey(code)
    {
        this.snake.turn(this.directions[code]);
        // console.log(code);
    }

    render()
    {
        setTimeout(()=>{

            this.map.clearSnake(this.snake);
            
            if(!this.snake.move(this.map))
            {
                this.snake.reset();
            }

            this.map.render(this.snake);

            this.render();
         }, this.options.speed);
    }
}

class GameMap
{
    constructor(options) {
        // speed, width, height, target
        this.options = options;
        this.clearMap();
    }

    clearMap()
    {
        this.map = [];
        let options = this.options;

        for(let y=0; y<options.width; ++y)
        {
            this.map[y] = [];
            for(let x=0; x<options.width; ++x)
                this.map[y][x] = new Cell({x, y});
        }
        this.renderDom();
    }

    renderDom() {
        let dom = document.getElementById(this.options.target);
        let data = '';
        let map = this.map;


        map.map((row, y) => {
            data += '<div class="game-row">';

            row.map((cell, x) => {
                data += `<div class="game-cell" data-cell-type="empty" data-coord="${x}:${y}"></div>`;
            });
            
            data += '</div>';
        });

        dom.innerHTML = data;        

        map.map((row, y) => {
            row.map((cell, x) => {
                cell.dom = document.querySelector(`[data-coord="${x}:${y}"]`);
            });
        });
        // console.log(map);
    }

    randomEmptyCell()
    {
        return this.cell(random_int(0, this.options.width), 
                         random_int(0, this.options.height));
    }

    cell(x, y)
    {
        // console.log('XY', x, y);
        return this.map[y][x];
    }

    clearSnake (snake)
    {
        snake.body.map(body => {
            let cell = this.cell(body.options.x, body.options.y)
            cell.setType('empty');
            cell.render();
        })
    }
    render (snake)
    {
        // console.log(snake.body);
        snake.body.map(body => {
            let cell = this.cell(body.options.x, body.options.y)
            cell.setType(body.type);
            cell.render();
        })
    }

}

class Cell 
{
    constructor(options) {
        // speed, width, height, target, x, y
        this.options = options;
        this.dom = null;
        this.type = options.type || 'empty';
    }

    get x() { return this.options.x; }
    get y() { return this.options.y; }

    clear ()
    {
        this.setType('empty');
    }

    setType(type)
    {
        this.type = type;
    }

    render ()
    {
        if(this.dom)
        {
            this.dom.dataset.cellType = this.type;
        }
    }    

}

class Snake
{
    constructor(options) {
        // speed, width, height, target
        this.options = options;
        this.reset();
    }

    move(map)
    {
        // console.log(this.body[0]);
        let body = this.body;
        let head = body[0];
        let {width, height} = map.options;
        let [x, y] = [(width  + head.options.x + this.direction[0]) % width, 
                      (height + head.options.y + this.direction[1]) % height
                    ];
        console.log(x, y);
        let isOk = !this.checkIsSnake(x, y);

        if(isOk && x>=0 && x < width && y >= 0 && y < height)
        {
            for(let b = body.length-1; b >= 1; --b )
            {
                body[b].options.x = body[b-1].x;
                body[b].options.y = body[b-1].y;
            }

            let cell = map.cell(x, y);
            if(cell.type != 'empty')
            {
                // console.log('CELL!!!', cell);
                this.eat(cell);
            }

            if(isOk)
            {
                head.options.x = x;
                head.options.y = y;
            }
        }
        else isOk = false;

        return isOk;
    }

    checkIsSnake(x, y)
    {
        for (let i=0; i<this.body.length; ++i)
        {
            let b = this.body[i];
            if(x===b.x && y===b.y) 
                return true;
        }

        return false;
    }

    eat(cell)
    {
        this.body.push(new Cell({ x: cell.x, y: cell.y, type: 'snake-'+cell.type }));
    }

    turn(direction)
    {
        if(direction)
            this.direction = direction;
    }

    reset()
    {
        this.body = [ new Cell({type: 'head', x: 20, y: 20}) ];
        this.direction = [0, -1];
    }
}
