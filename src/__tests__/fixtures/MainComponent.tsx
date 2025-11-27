import type { ParentComponent } from 'solid-js';

export const Main: ParentComponent = props => {
  return <div>{props.children}</div>;
};
