import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { ReactiveVar } from '@apollo/client/core';

import { installRouter } from 'pwa-helpers/router';

import { makeVar } from '@apollo/client/core';

export const locationVar = makeVar(window.location);

installRouter(loc => locationVar({ ...loc }));

export class ChangeEvent<T> extends Event {
  constructor(public value: T) {
    super('change');
  }
}

export class ReactiveVarController<T> extends EventTarget implements ReactiveController {
  declare value: T;

  constructor(
    private host: ReactiveControllerHost,
    public variable: ReactiveVar<T>,
  ) {
    super();
    this.host.addController(this);
    this.variable.onNextChange(this.#onNextChange);
    this.value = this.variable();
  }

  public set(x: T) {
    this.variable(x);
  }

  #onNextChange = (val: T) => {
    this.value = val;
    this.dispatchEvent(new ChangeEvent(val));
    this.host.requestUpdate();
    this.variable.onNextChange(this.#onNextChange);
  }

  hostUpdate?(): unknown
}
