import HubComponent from '../hub-component';
import { Preferences } from '../preferences';

export default abstract class BaseReactor extends HubComponent {
  prefs: Preferences;

  constructor(arg) {
    super(arg);
    this.prefs = new Preferences(this, this.name);
    this.setUpPreferences();
  }

  async start(): Promise<void> {
    // fetch state
    const state = await this.fetchState();

    if (state && state.preferences) {
      this.prefs.load(state.preferences);
    }
  }

  // probably augmented by subclasses
  get state(): object | undefined {
    if (this.prefs.prefNames.length > 0) {
      return { preferences: this.prefs };
    }

    return undefined;
  }

  setUpPreferences(): void {}

  fetchState(): any {
    return this.hub.env.fetchState(this.name);
  }

  saveState(): void {
    const state = this.state;
    if (!state) return;

    this.hub.env.saveState(this.name, state);
  }
}
