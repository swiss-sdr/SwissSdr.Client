export function themeConfig($mdThemingProvider) {
    'ngInject';
    $mdThemingProvider.definePalette('swisssdrTheme', {
        '50': 'f8bc77',
        '100': 'f8bc77',
        '200': 'ef9a9a',
        '300': 'e57373',
        '400': 'ef5350',
        '500': '4D7EA8',    // base
        '600': 'ef8914',    // accent
        '700': 'ef8914',
        '800': '01161E',
        '900': '01161E',    // base dark
        'A100': 'ef8914',
        'A200': 'ef8914',
        'A400': 'ef8914',
        'A700': 'ef8914',
        'contrastDefaultColor': 'light'
    });
    $mdThemingProvider.theme('default')
        .primaryPalette('swisssdrTheme')
        .accentPalette('swisssdrTheme')
}
