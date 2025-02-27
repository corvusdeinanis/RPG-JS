import { ModuleType, RpgShape, Direction, Control } from '@rpgjs/common'
import { RpgPlayer } from './Player/Player'
import { RpgMap } from './Game/Map'
import { RpgServerEngine } from './server'
import { MapOptions } from './decorators/map'
import { RpgClassMap } from './Scenes/Map'
import { TiledMap } from '@rpgjs/tiled'
import { WorldMap } from './Game/WorldMaps'
import { MatchMakerOption, RpgMatchMaker } from './MatchMaker'
import { IStoreState } from './Interfaces/StateStore'

export interface RpgServerEngineHooks {
    /**
     *  When the server starts
     * 
     * @prop { (engine: RpgServerEngine) => any } [onStart]
     * @memberof RpgServerEngineHooks
     */
    onStart?: (server: RpgServerEngine) => any

    /**
     *  At each server frame. Normally represents 60FPS
     * 
     * @prop { (engine: RpgServerEngine) => any } [onStep]
     * @memberof RpgServerEngineHooks
     */
     onStep?: (server: RpgServerEngine) => any
}

export interface RpgPlayerHooks {
    /**
     *  Set custom properties on the player. Several interests:
     * 1. The property is shared with the client
     * 2. If you save with `player.save()`, the property will be saved to be reloaded later
     * 3. If you use horizontal scaling, the property will be kept in memory if the player changes the map and this map is on another server
     * 
     * Example:
     * 
     * ```ts
     * import { RpgPlayerHooks } from '@rpgjs/server'
     * 
     * declare module '@rpgjs/server' {
     *  export interface RpgPlayer {
     *      nbWood: number
     *  }
     * }
     * 
     * export const player: RpgPlayerHooks = {
     *  props: {
     *      nbWood: Number
     *  }
     * }
     * ```
     * 
     * This is a simple example. Let's say that the player can have a number of harvested woods, then 
     * 1. you must specify the type for Typescript
     * 2. Add the property in props
     * 
     * You can also set up with this object:
     * 
     * ```
     *  {
            $default: <any> (undefined by default), 
            $syncWithClient: <boolean> (true by default),
            $permanent: <boolean> (true by default)
        }
        ```
     * 
     * - Indicate if the property should be shared with the client
     * 
     * Example:
     * 
     * ```ts
     * export const player: RpgPlayerHooks = {
     *  props: {
     *      secretProp: {
     *          $syncWithClient: false
     *      }
     *  }
     * }
     * ```
     * 
     * - Indicate if the property should be registered in a database. If the data is just temporary to use on the current map:
     * 
     * ```ts
     * export const player: RpgPlayerHooks = {
     *  props: {
     *      tmpProp: {
     *          $permanent: false
     *      }
     *  }
     * }
     * ```
     * 
     * @prop {object} [props]
     * @since 3.0.0-beta.9
     * @memberof RpgPlayerHooks
     */
    props?: {
        [key: string]: any
    }

     /**
     *  When the player joins the map
     * 
     * @prop { (player: RpgPlayer, map: RpgMap) => any } [onJoinMap]
     * @memberof RpgPlayerHooks
     */
    onJoinMap?: (player: RpgPlayer, map: RpgMap) => any

     /**
     *  When the player is connected to the server
     * 
     * @prop { (player: RpgPlayer) => any } [onConnected]
     * @memberof RpgPlayerHooks
     */
    onConnected?: (player: RpgPlayer) => any

     /**
     *  When the player presses a key on the client side
     * 
     * @prop { (player: RpgPlayer, data: { input: Direction | Control | string, moving: boolean }) => any } [onInput]
     * @memberof RpgPlayerHooks
     */
    onInput?: (player: RpgPlayer, data: { input: Direction | Control | string, moving: boolean }) => any

     /**
     *  When the player leaves the map
     * 
     * @prop { (player: RpgPlayer, map: RpgMap) => any } [onLeaveMap]
     * @memberof RpgPlayerHooks
     */
    onLeaveMap?: (player: RpgPlayer, map: RpgMap) => any

     /**
     *  When the player increases one level
     * 
     * @prop { (player: RpgPlayer, nbLevel: number) => any } [onLevelUp]
     * @stability 1
     * @memberof RpgPlayerHooks
     */
    onLevelUp?: (player: RpgPlayer, nbLevel: number) => any

     /**
     *  When the player's HP drops to 0
     * 
     * @prop { (player: RpgPlayer) => any } [onDead]
     * @stability 1
     * @memberof RpgPlayerHooks
     */
    onDead?: (player: RpgPlayer) => any,

     /**
     *  When the player leaves the server
     * 
     * @prop { (player: RpgPlayer) => any } [onDisconnected]
     * @memberof RpgPlayerHooks
     */
    onDisconnected?: (player: RpgPlayer) => any

     /**
     *  When the player enters the shape
     * 
     * @prop { (player: RpgPlayer, shape: RpgShape) => any } [onInShape]
     * 3.0.0-beta.3
     * @memberof RpgPlayerHooks
     */
    onInShape?: (player: RpgPlayer, shape: RpgShape) => any

    /**
     *  When the player leaves the shape
     * 
     * @prop { (player: RpgPlayer, shape: RpgShape) => any } [onOutShape]
     * 3.0.0-beta.3
     * @memberof RpgPlayerHooks
     */
     onOutShape?: (player: RpgPlayer, shape: RpgShape) => any

     /**
     * When the x, y positions change
     * 
     * @prop { (player: RpgPlayer) => any } [onMove]
     * @since 3.0.0-beta.4
     * @memberof RpgPlayerHooks
     */
     onMove?: (player: RpgPlayer) => any

     /**
     * Allow or not the player to switch maps. `nexMap` parameter is the retrieved RpgMap class and not the instance
     * 
     * @prop { (player: RpgPlayer, nextMap: RpgClassMap<RpgMap>) =>  boolean | Promise<boolean> } [canChangeMap]
     * @since 3.0.0-beta.8
     * @memberof RpgPlayerHooks
     */
     canChangeMap?: (player: RpgPlayer, nextMap: RpgClassMap<RpgMap>) => boolean | Promise<boolean>
}

export interface RpgServer { 

    /**
     * Adding sub-modules
     *
     * @prop { { client: null | Function, server: null | Function }[]} [imports]
     * @memberof RpgServer
     */
    imports?: ModuleType[]

    /**
     * Object containing the hooks concerning the engine
     * 
     * ```ts
     * import { RpgServerEngine, RpgServerEngineHooks, RpgModule, RpgClient } from '@rpgjs/server'
     * 
     * const engine: RpgEngineHooks = {
     *      onStart(server: RpgServerEngine) {
     *          console.log('server is started')
     *      }
     * }
     * 
     * @RpgModule<RpgServer>({
     *      engine
     * })
     * class RpgServerModule {}
     * ```
     * 
     * @prop {RpgServerEngineHooks} [engine]
     * @memberof RpgServer
     */
    engine?: RpgServerEngineHooks

    /** 
     * Give the `player` object hooks. Each time a player connects, an instance of `RpgPlayer` is created.
     * 
     * ```ts
     * import { RpgPlayer, RpgServer, RpgPlayerHooks, RpgModule } from '@rpgjs/server'
     * 
     * const player: RpgPlayerHooks = {
     *      onConnected(player: RpgPlayer) {
     *          
     *      }
     * }
     * 
     * @RpgModule<RpgServer>({
     *      player
     * })
     * class RpgServerEngine { } 
     * ``` 
     * 
     * @prop {RpgClassPlayer<RpgPlayer>} [player]
     * @memberof RpgServer
     * */
    player?: RpgPlayerHooks,

    /** 
     * References all data in the server. it is mainly used to retrieve data according to their identifier
     * 
     * ```ts
     * import { RpgServer, RpgModule } from '@rpgjs/server'
     * import { Potion } from 'my-database/items/potion'
     * 
     * @RpgModule<RpgServer>({
     *      database: {
     *          Potion
     *      }
     * })
     * class RpgServerEngine { } 
     * ``` 
     * 
     * @prop { { [dataName]: data } } [database]
     * @memberof RpgServer
     * */
    database?: object,

    /** 
     * Array of all maps. Each element is an `RpgMap` class
     * 
     * ```ts
     * import { RpgMap, MapData, RpgServer, RpgModule } from '@rpgjs/server'
     * 
     * @MapData({
     *      id: 'town',
     *      file: require('./tmx/mymap.tmx'),
     *      name: 'Town'
     * })
     * class TownMap extends RpgMap { }
     * 
     * @RpgModule<RpgServer>({
     *      maps: [
     *          TownMap
     *      ]
     * })
     * class RpgServerEngine { } 
     * ``` 
     * 
     * It is possible to just give the object as well
     * 
     * ```ts
     * @RpgModule<RpgServer>({
     *      maps: [
     *          {
     *              id: 'town',
     *              file: require('./tmx/mymap.tmx'),
     *              name: 'Town'
     *          }
     *      ]
     * })
     * class RpgServerEngine { } 
     * ``` 
     * 
     * Since version 3.0.0-beta.8, you can just pass the path to the file. The identifier will then be the name of the file
     * 
     *  ```ts
     * @RpgModule<RpgServer>({
     *      maps: [
     *          require('./tmx/mymap.tmx') // id is "mymap"
     *      ]
     * })
     * class RpgServerEngine { } 
     * ``` 
     * 
     * @prop {RpgClassMap<RpgMap>[]} [maps]
     * @memberof RpgServer
     * */
    maps?: RpgClassMap<RpgMap>[] | MapOptions[] | string[] | TiledMap[],

    /**
     * Loads the content of a `.world` file from Tiled Map Editor into the map scene
     * 
     * > Note, that if the map already exists (i.e. you have already defined an RpgMap), the world will retrieve the already existing map. Otherwise it will create a new map
     * 
     * @prop {object[]} [worldMaps]
     * object is 
     * ```ts
     * {
     *  id?: string
     *  maps: {
     *      id?: string
     *      properties?: object
     *      fileName: string;
            height: number;
            width: number;
            x: number;
            y: number;
     *  }[],
        onlyShowAdjacentMaps: boolean, // only for Tiled Map Editor
        type: 'world' // only for Tiled Map Editor
     * }
     * ```
     * @param {RpgSceneMap} sceneMap
     * @since 3.0.0-beta.8
     * @example
     * ```ts
     * import myworld from 'myworld.world'
     * 
     * @RpgModule<RpgServer>({
     *      worldMaps: [
     *          myworld
     *      ]
     * })
     * class RpgServerEngine { } 
     * ```
     * @memberof RpgServer
     */
    worldMaps?: WorldMap[]

    
    /** 
     * Combat formula used in the method player.applyDamage(). There are already formulas in the RPGJS engine but you can customize them
     *  
     * ```ts
     * damageFormulas: {
     *      damageSkill: (a, b, skill) => number,
     *      damagePhysic: (a, b) => number,
     * 
     *      // damage: the damages calculated from the previous formulas
     *      damageCritical: (damage, a, b) => number
     *      coefficientElementsa : (a, b, bDef) => number
     * }
     * ```
     * 
     * `a` represents the attacker's parameters
     * `b` represents the defender's parameters
     * 
     * Example:
     * 
     * ```ts
     * import { RpgModule, RpgServer, Presets } from '@rpgjs/server'
     * 
     * const { ATK, PDEF } = Presets
     * 
     * @RpgModule<RpgServer>({
     *      damageFormulas: {
     *          damagePhysic(a, b) {
     *              let damage = a[ATK] - b[PDEF]
     *              if (damage < 0) damage = 0
     *              return damage
     *          }
     *      }
     * })
     * class RpgServerEngine { } 
     * ```
     * @prop {object} damageFormulas
     * @memberof RpgServer
     * */
    damageFormulas?: {
        damageSkill?: (a, b, skill) => number,
        damagePhysic?: (a, b) => number,
        damageCritical?: (damage, a, b) => number
        coefficientElements?: (a, b, bDef) => number
    }

    scalability?: {
        matchMaker: MatchMakerOption,
        stateStore: IStoreState
        hooks: {
            onConnected(store: IStoreState, matchMaker: RpgMatchMaker, player: RpgPlayer): Promise<boolean> | boolean
            doChangeServer(store: IStoreState, matchMaker: RpgMatchMaker, player: RpgPlayer): Promise<boolean> | boolean
        }
    }
}
