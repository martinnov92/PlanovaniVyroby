export const FULL_FORMAT = 'D.M.YYYY dddd';
export const DATA_DATE_FORMAT = 'DD.MM.YYYY HH:mm';
export const INPUT_DATE_TIME_FORMAT = 'YYYY-MM-DDThh:mm';

export function createClassName(classNames) {
    return classNames.filter((cls) => cls).join(' ');
}
