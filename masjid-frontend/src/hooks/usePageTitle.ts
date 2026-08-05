import { useEffect } from "react";

export function usePageTitle(title?: string, suffix = "Masjid Nurul Ilmi") {
    useEffect(() => {
        document.title = title
            ? suffix
                ? `${title} | ${suffix}`
                : title
            : suffix;
    }, [title, suffix]);
}
