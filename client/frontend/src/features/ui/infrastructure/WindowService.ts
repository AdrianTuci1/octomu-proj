import {
    WindowSetSize,
    WindowCenter,
    WindowSetAlwaysOnTop,
    EventsEmit
} from '../../../../wailsjs/runtime/runtime';

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

        WindowSetSize(config.width, config.height);
        WindowCenter();
        WindowSetAlwaysOnTop(config.alwaysOnTop);

        // Tell the Go backend whether to hide on blur
        EventsEmit('octomus:window-mode', layout);

        this.currentLayout = layout;
    }

    getCurrentLayout(): WindowLayout {
        return this.currentLayout;
    }
}
