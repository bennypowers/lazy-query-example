import { LitElement, html, TemplateResult, PropertyValues } from 'lit';
import { ApolloQueryController } from '@apollo-elements/core';
import { customElement, property } from 'lit/decorators.js';

import { AppQuery, LaunchQuery } from './App.query.graphql';
import { locationVar, ReactiveVarController } from '../../router.js';

import style from './app.css';
import shared from '../shared.css';

@customElement('apollo-app')
export class ApolloApp extends LitElement {
  static readonly is = 'apollo-app';

  static readonly styles = [shared, style];

  query = new ApolloQueryController(this, AppQuery);

  render(): TemplateResult {
    const launches = this.query.data?.launches ?? [];
    return html`
      <ul>${launches.map(launch => html`
        <li><a href="/launch/${launch.id}">${launch.mission_name}</li>`)}
      </ul>
      <div id="page">
        <slot name="page"></slot>
      </div>
    `;
  }
}

@customElement('app-page')
export class AppPage extends LitElement {
  static readonly is = 'app-page';

  static readonly styles = [shared];

  @property({ attribute: 'launch-id', reflect: true }) launchId: string | null = null;

  query = new ApolloQueryController(this, LaunchQuery, {
    shouldSubscribe(params) {
      return !!params?.variables?.launchId;
    },
  })

  router = new ReactiveVarController(this, locationVar);

  connectedCallback(): void {
    super.connectedCallback();
    this.router.addEventListener('change', this.setLaunchId);
    this.setLaunchId();
  }

  updated(changed: PropertyValues<this>) {
    if (changed.has('launchId'))
      this.query.subscribe({ variables: { launchId: this.launchId } });
  }

  setLaunchId = () => {
    this.launchId = this.router.value.pathname.split('/').pop() || null;
  }

  pretty = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' })

  render() {
    const launch = this.query.data?.launch;
    return html`
      <article ?hidden=${!this.query.data}>
        <h2>${launch?.mission_name}</h2>
        <p>
          ${launch?.rocket?.rocket_name} -
          <time datetime=${launch?.launch_date_utc}>${this.pretty.format(launch?.launch_date_utc ?? new Date())}</time>
        </p>
        <p>${launch?.details}</p>
        <a href="${launch?.links?.article_link}">Read More</a>
      </article>
    `;
  }
}
