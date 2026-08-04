import { useEffect } from "react";

export function usePageTitle(title: string, suffix = "Masjid Nurul Ilmi") {
    useEffect(() => {
        document.title = suffix ? `${title} | ${suffix}` : title;
    }, [title, suffix]);
}