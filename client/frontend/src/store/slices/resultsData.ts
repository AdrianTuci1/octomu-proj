// resultsData.ts — aggregates all result categories into DEFAULT_RESULTS.
// To add or remove a category, edit results/index.ts.
import { IResultItem } from '../../domain/types';
import {
    WINDOW_MANAGEMENT_RESULTS,
    SYSTEM_ACTIONS_RESULTS,
    AI_COMMANDS_RESULTS,
    UTILITIES_RESULTS,
    EXTENSIONS_RESULTS,
    OCTOMUS_SETTINGS_RESULTS,
    APPS_RESULTS,
} from './results';

export const DEFAULT_RESULTS: IResultItem[] = [
    ...WINDOW_MANAGEMENT_RESULTS,
    ...SYSTEM_ACTIONS_RESULTS,
    ...AI_COMMANDS_RESULTS,
    ...UTILITIES_RESULTS,
    ...EXTENSIONS_RESULTS,
    ...OCTOMUS_SETTINGS_RESULTS,
    ...APPS_RESULTS,
];
