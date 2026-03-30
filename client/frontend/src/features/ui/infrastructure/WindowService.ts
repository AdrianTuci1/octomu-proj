import {
    Window,
    Events
} from '@wailsio/runtime';

export type WindowLayout = 'compact' | 'panel';

interface LayoutConfig {
    width: number;
    height: number;
    alwaysOnTop: boolean;
}

const LAYOUTS: Record<WindowLayout, LayoutConfig> = {
    compact: {
        width: 750,
        height: 450,
        alwaysOnTop: true,
    },
    panel: {
        width: 900,
        height: 650,
        alwaysOnTop: false,
    },
};

export class WindowService {
    private currentLayout: WindowLayout = 'compact';

    applyLayout(layout: WindowLayout): void {
        if (this.currentLayout === layout) return;

        const config = LAYOUTS[layout];

        Window.SetSize(config.width, config.height);
        Window.Center();
        Window.SetAlwaysOnTop(config.alwaysOnTop);

        // Tell the Go backend whether to hide on blur
        Events.Emit('octomus:window-mode', layout);

        this.currentLayout = layout;
    }

    getCurrentLayout(): WindowLayout {
        return this.currentLayout;
    }
}
