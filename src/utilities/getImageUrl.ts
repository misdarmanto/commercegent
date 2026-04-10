import { CONFIGS } from '../configs';

export function getImageUrl(path: string): string {
    return `${CONFIGS.uploadFileUrl}/${path}`;
}
