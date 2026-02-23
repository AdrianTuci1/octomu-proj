import { IResultItem } from '../../../domain/types';

export interface IResultsInfrastructure {
    getInstalledApps(): Promise<IResultItem[]>;
    executeSystemCommand(command: string): Promise<string>;
    launchApp(path: string): Promise<void>;
}

export class ResultsInfrastructure implements IResultsInfrastructure {
    async getInstalledApps(): Promise<IResultItem[]> {
        try {
            // @ts-ignore
            const raw = await window.go.main.App.GetInstalledApps();
            if (raw) {
                return JSON.parse(raw);
            }
            return [];
        } catch (err) {
            console.error('[ResultsInfrastructure] Failed to get installed apps:', err);
            return [];
        }
    }

    async executeSystemCommand(command: string): Promise<string> {
        // @ts-ignore
        return await window.go.main.App.ExecuteSystemCommand(command);
    }

    async launchApp(path: string): Promise<void> {
        await this.executeSystemCommand(`open "${path}"`);
    }
}
