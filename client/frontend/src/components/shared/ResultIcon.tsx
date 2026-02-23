import React from 'react';
import * as LucideIcons from 'lucide-react';
import { IResultItem, IMCPRegistryItem } from '../../domain/types';

interface ResultIconProps {
    item: IResultItem | IMCPRegistryItem;
    size?: number;
}

export const ResultIcon: React.FC<ResultIconProps> = ({ item, size = 14 }) => {
    // 1. Handle base64 app icons
    if ('iconBase64' in item && item.iconBase64) {
        return (
            <img
                src={`data:image/png;base64,${item.iconBase64}`}
                alt=""
                style={{ width: size, height: size, objectFit: 'contain' }}
            />
        );
    }

    // 2. Handle Lucide icons
    const iconName = item.icon;
    const icon = iconName ? (LucideIcons as any)[iconName] : null;

    if (icon) {
        const IconComponent = icon;
        return <IconComponent size={size} />;
    }

    // 3. Fallback
    return <LucideIcons.Command size={size} />;
};
