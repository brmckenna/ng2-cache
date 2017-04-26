# ng2-caching

Wrapper for ng2-cache which consolidates and manages underlying storages.

## Installation

To install this library, run:

```bash
$ npm install ng2-caching --save
```

Usage:

```typescript

import {Component} from '@angular/core';
import {CachingService, CacheOptionsInterface, CacheStoragesEnum} from 'ng2-cacher/ng2-cacher';

declare var BUILD_VERSION: string;

@Component({
    selector: 'some-selector',
    template: '<div>Template</div>',
    providers: [ CachingService ]
})
export class ExampleComponent {

    constructor(private _cachingService: CachingService) {}

    public func() {

        
        this._cachingService.set('key', 'value', CacheStoragesEnum.SESSION_STORAGE);

        let myValue: string = this._cachingService.get<string>('key');

    }
}

```

By default the service stores data in session storage but supports the following:
 - session storage
 - local storage
 - memory

If current storage is not available - service will choose memory storage.

To change storage to local storage:

```typescript
this._cachingService.set('key', 'value', CacheStoragesEnum.LOCAL_STORAGE);


```

## License

ISC © [Brendan R McKenna](https://github.com/brmckenna)

