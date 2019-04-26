interface Setting {
    name: string;
    requires?: string[];
}

interface Component {
    name: string;
}

const defaultFilterOptions: any = {
    omitRequires: true,
};

/**
 * Filters the settings list using components and keep only entries
 * where the requires array is emprty or has at least
 * one element present in the components array
 *
 * @param settings {Setting[]}
 * @param components {Component[]}
 * @param options {Object} Options
 * @param [options.omitRequires] Whether or not to include the requires in the response (false)
 * @return {Setting[]}
 */
const filter = function filterSettingsFromComponents(settings: Setting[], components: Component[], options: any = defaultFilterOptions): Setting[] {
    // Make an array with the names only: ['audio','LED array'...etc]
    const componentsNames: string[] = components.map(component => component.name);

    // Destructure the setting and returns true only if it's a match
    const availableSettings = settings.filter(({requires=[]}): boolean => {
        return !requires.length || requires.some((requiredModule): boolean => componentsNames.includes(requiredModule));
    });

    // Avoid the require array in the results if specified by the options (default: true)
    if (options.omitRequires) {
        return availableSettings.map(({name}): Setting => ({name}));
    }
    return availableSettings;
};

export default filter;
