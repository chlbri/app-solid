/**
 *
 * All paths of the concerned files
 *
 * ### Author
 *
 * chlbri (bri_lvi@icloud.com)
 *
 * [My GitHub](https://github.com/chlbri?tab=repositories)
 *
 * <br/>
 *
 * ### Documentation
 *
 * Link to machine lib [here](https://www.npmjs.com/package/@bemedev/app-ts).
 *
 * Link to this lib [here](https://www.npmjs.com/package/@bemedev/app-cli)
 *
 *
 * This file is auto-generated. Do not edit manually.
 */
export type _AllPaths = {
  machine2:
    | '/'
    | '/idle'
    | '/working'
    | '/working/fetch'
    | '/working/fetch/idle'
    | '/working/fetch/fetch'
    | '/working/ui'
    | '/working/ui/idle'
    | '/working/ui/input'
    | '/working/ui/final'
    | '/final';
};
/**
 *
 * Constants as type helpers for the concerned file.
 * Don't use it as values, just for typings
 *
 * ### Author
 *
 * chlbri (bri_lvi@icloud.com)
 *
 * [My GitHub](https://github.com/chlbri?tab=repositories)
 *
 * <br/>
 *
 * ### Documentation
 *
 * Link to machine lib [here](https://www.npmjs.com/package/@bemedev/app-ts).
 *
 * Link to this lib [here](https://www.npmjs.com/package/@bemedev/app-cli)
 *
 * NB: This file is auto-generated. Do not edit manually.
 */
export const SCHEMAS = {
  machine2: {
    __tsSchema: undefined as unknown as {
      readonly targets: Exclude<_AllPaths['machine2'], '/'>;
      readonly states: {
        readonly idle: {
          readonly targets: Exclude<_AllPaths['machine2'], '/idle'>;
        };
        readonly working: {
          readonly targets: Exclude<_AllPaths['machine2'], '/working'>;
          readonly states: {
            readonly fetch: {
              readonly targets: Exclude<
                _AllPaths['machine2'],
                '/working/fetch'
              >;
              readonly states: {
                readonly idle: {
                  readonly targets: Exclude<
                    _AllPaths['machine2'],
                    '/working/fetch/idle'
                  >;
                };
                readonly fetch: {
                  readonly targets: Exclude<
                    _AllPaths['machine2'],
                    '/working/fetch/fetch'
                  >;
                };
              };
              readonly initial: 'idle' | 'fetch';
            };
            readonly ui: {
              readonly targets: Exclude<
                _AllPaths['machine2'],
                '/working/ui'
              >;
              readonly states: {
                readonly idle: {
                  readonly targets: Exclude<
                    _AllPaths['machine2'],
                    '/working/ui/idle'
                  >;
                };
                readonly input: {
                  readonly targets: Exclude<
                    _AllPaths['machine2'],
                    '/working/ui/input'
                  >;
                };
                readonly final: {
                  readonly targets: Exclude<
                    _AllPaths['machine2'],
                    '/working/ui/final'
                  >;
                };
              };
              readonly initial: 'idle' | 'input' | 'final';
            };
          };
        };
        readonly final: {
          readonly targets: Exclude<_AllPaths['machine2'], '/final'>;
        };
      };
      readonly initial: 'idle' | 'working' | 'final';
    },
  },
};
