import { RpgPlayer, RpgMap, RpgPlayerHooks, Direction, Move, RpgShape, ShapePositioning, Control, RpgEvent, EventData, RpgWorld } from '@rpgjs/server'
import { Armor } from '@rpgjs/database'

let i=0

@Armor({  
    name: 'Shield',
    description: 'Gives a little defense',
    price: 4000
})
export class Shield {}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

declare module '@rpgjs/server' {
    export interface RpgPlayer {
        woold: number
    }
}

export const player: RpgPlayerHooks = {
    props: {
        woold: {
            $default: 0, 
            $syncWithClient: true,
            $permanent: false
        }
    },
    onConnected(player: RpgPlayer) {
        player.setHitbox(32, 16)
        player.setGraphic('male1_2')
        player.changeMap('cave')
    },
    onJoinMap(player: RpgPlayer, map: RpgMap) { 
        
    },
    onInput(player: RpgPlayer, { input, moving }) {
        if (input == Control.Back) {
            player.addItem(Shield)
            player.callMainMenu()
        }
    },
    async onInShape(player: RpgPlayer, shape: RpgShape) {
        console.log('in', player.name, shape.name)
        // await player.changeMap('samplemap')
    },
    onOutShape(player: RpgPlayer, shape: RpgShape) {
        console.log('out', player.name, shape.name)
    }
}