import { Injectable } from '@angular/core';
import {CacheService } from './cache.service';
import { CacheOptionsInterface } from '../interfaces/cache-options.interface';
import { CacheStoragesEnum } from '../enums/cache-storages.enum';
import { CacheSessionStorage } from './storage/session-storage/cache-session-storage.service';
import { CacheLocalStorage } from './storage/local-storage/cache-local-storage.service';
import { CacheMemoryStorage } from './storage/memory/cache-memory.service';

import * as _ from 'lodash';

export { CacheOptionsInterface } from '../interfaces/cache-options.interface';
export { CacheStoragesEnum } from '../enums/cache-storages.enum';

@Injectable()
export class CachingService {
    //underlying caches used to store the vars:
    //sessionCache uses Window.sessionStorage
    private sessionCache: CacheService;
    //localCache uses Window.localStorage
    private localCache: CacheService;
    //memCache uses an in memory associative array
    private memCache: CacheService;
    //in memory cache used to associate a key with a specific underlying cache to determine lookups
    private cacheMap: { [key: string]: CacheStoragesEnum } = {};
   
    constructor() {
        this.initialize();
    }

    initialize() {
        this.sessionCache = new CacheService(new CacheSessionStorage());
        this.localCache = new CacheService(new CacheLocalStorage());
        this.memCache = new CacheService(new CacheMemoryStorage());
    }
   
    public set(key: string, value: any, storeType: CacheStoragesEnum, options?: CacheOptionsInterface) {
        //default any invalid storeType to SESSION_STORAGE
        storeType = (storeType === CacheStoragesEnum.LOCAL_STORAGE || storeType === CacheStoragesEnum.MEMORY)
            ? storeType : CacheStoragesEnum.SESSION_STORAGE;
        
        // prevent same key stored across multiple caches.  If user specifies a new storage type then allow and remove existing storage. 
        // If we wish to block storage after initial store then uncomment the return line below and make func return boolean indicating success/fail
        let dupKey = this.cacheMap[key];
        if (dupKey !== undefined && dupKey !== storeType) {
            //return; 
            this.remove(key);
        }
        switch (storeType) {
            case CacheStoragesEnum.LOCAL_STORAGE:
                this.cacheMap[key] = storeType;
                this.localCache.set(key, value, options);
                break;

            case CacheStoragesEnum.SESSION_STORAGE:
                this.cacheMap[key] = storeType;
                this.sessionCache.set(key, value, options);
                break;

            case CacheStoragesEnum.MEMORY:
                this.cacheMap[key] = storeType;
                this.memCache.set(key, value, options);
                break;
        }
    }
    
    public get<T>(key: string): T  {
        let cacheLocation = this.cacheMap[key] !== undefined ? this.cacheMap[key] : null;
        let returnVal: T;
        let cacheProvider: any = null;

        switch (cacheLocation) {
            case CacheStoragesEnum.LOCAL_STORAGE:
                cacheProvider = this.localCache;
                break;

            case CacheStoragesEnum.SESSION_STORAGE:
                cacheProvider = this.sessionCache;
                break;
           
            case CacheStoragesEnum.MEMORY:
                cacheProvider = this.memCache;
                break;
        }
       
        if (cacheProvider !== null && cacheProvider !== undefined) {
            returnVal = cacheProvider.get(key);
        }

        if (returnVal !== null && returnVal !== undefined) {
            return returnVal;
        }

        return null;
    }

    public exists(key: string): boolean {
        return !!this.get(key);
    }

    public remove(key: string) {
        let cacheLocation = this.cacheMap[key] !== undefined ? this.cacheMap[key] : null;

        if (cacheLocation === null || key === null || key === undefined) {
            return;
        }

        //remove from underlying cache
        switch (cacheLocation) {
            case CacheStoragesEnum.LOCAL_STORAGE:
                this.localCache.remove(key);
                break;

            case CacheStoragesEnum.SESSION_STORAGE:
                this.sessionCache.remove(key);
                break;

            case CacheStoragesEnum.MEMORY:
                this.memCache.remove(key);
                break;
        }
        //remove from cacheMap
        delete this.cacheMap[key];
    }

    //remove all keys on a per-cache or global level.  If no storeType is provided all caches will be cleared.
    public removeAll(storeType?: CacheStoragesEnum) {
        if (storeType === undefined || storeType === null) {
            this.sessionCache.removeAll();
            this.localCache.removeAll();
            this.memCache.removeAll();
            this.cacheMap = {};
            return;
        }
        //remove all keys for a particular storeType
        _.forEach(this.cacheMap,
            (value, key) => {
                if (value === storeType) {
                    this.remove(key);
                }
            });
    }

    public getTagData(tag: string, storeType: CacheStoragesEnum) {
        switch (storeType) {
            case CacheStoragesEnum.LOCAL_STORAGE:
                return this.localCache.getTagData(tag);

            case CacheStoragesEnum.SESSION_STORAGE:
                return this.sessionCache.getTagData(tag);

            case CacheStoragesEnum.MEMORY:
                return this.memCache.getTagData(tag);

            default:
                return null;
        }
    }

    public removeTag(tag: string, storeType: CacheStoragesEnum) {
        switch (storeType) {
            case CacheStoragesEnum.LOCAL_STORAGE:
                this.localCache.removeTag(tag);
                break;

            case CacheStoragesEnum.SESSION_STORAGE:
                this.sessionCache.removeTag(tag);
                break;

            case CacheStoragesEnum.MEMORY:
                this.memCache.removeTag(tag);
                break;
        }
    }

    public setGlobalPrefix(prefix: string, storeType: CacheStoragesEnum) {
        switch (storeType) {
            case CacheStoragesEnum.LOCAL_STORAGE:
                this.localCache.setGlobalPrefix(prefix);
                break;

            case CacheStoragesEnum.SESSION_STORAGE:
                this.sessionCache.setGlobalPrefix(prefix);
                break;
           
            case CacheStoragesEnum.MEMORY:
                this.memCache.setGlobalPrefix(prefix);
                break;
        }
    }
}