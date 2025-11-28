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
  machine1: '/' | '/idle' | '/final';
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
  machine1: {
    __tsSchema: undefined as unknown as {
      readonly targets: Exclude<_AllPaths['machine1'], '/'>;
      readonly states: {
        readonly idle: {
          readonly targets: Exclude<_AllPaths['machine1'], '/idle'>;
        };
        readonly final: {
          readonly targets: Exclude<_AllPaths['machine1'], '/final'>;
        };
      };
      readonly initial: 'idle' | 'final';
    },
  },
};
