import { useState, useEffect } from 'react';

export interface SearchResult {
    favicon: string;
    link: string;
    title: string;
}

export interface SearchResultsComponentProps {
    searchResults: SearchResult[];
}

const SearchResultsComponent = ({ searchResults }: { searchResults: SearchResult[] }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [loadedFavicons, setLoadedFavicons] = useState<boolean[]>([]);

    useEffect(() => {
        setLoadedFavicons(Array(searchResults.length).fill(false));
    }, [searchResults]);

    const toggleExpansion = () => setIsExpanded(!isExpanded);
    const visibleResults = isExpanded ? searchResults : searchResults.slice(0, 4);

    const handleFaviconLoad = (index: number) => {
        setLoadedFavicons((prev) => {
            const updated = [...prev];
            updated[index] = true;
            return updated;
        });
    };

    const SearchResultsSkeleton = () => (
        <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[--card-hover] w-[calc(50%-4px)] md:w-[calc(25%-6px)] animate-pulse">
                    <div className="w-4 h-4 rounded bg-[--divider] flex-shrink-0" />
                    <div className="h-3 rounded bg-[--divider] flex-1" />
                </div>
            ))}
        </div>
    );

    return (
        <div className="bg-[--card-bg] border border-[--card-border] rounded-xl p-4 mt-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[--text-muted] mb-3">Sources</h2>
            {searchResults.length === 0 ? (
                <SearchResultsSkeleton />
            ) : (
                <div className="flex flex-wrap gap-2">
                    {visibleResults.map((result, index) => (
                        <a
                            key={`searchResult-${index}`}
                            href={result.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[--card-hover] hover:bg-[--divider] border border-transparent hover:border-[--card-border] transition-all w-[calc(50%-4px)] md:w-[calc(25%-6px)] min-w-0"
                        >
                            {result.favicon.length > 0 && (
                                <>
                                    {!loadedFavicons[index] && (
                                        <div className="w-4 h-4 rounded bg-[--divider] flex-shrink-0 animate-pulse" />
                                    )}
                                    <img
                                        src={result.favicon}
                                        alt=""
                                        className={`w-4 h-4 flex-shrink-0 ${loadedFavicons[index] ? 'block' : 'hidden'}`}
                                        onLoad={() => handleFaviconLoad(index)}
                                    />
                                </>
                            )}
                            <span className="text-xs text-[--text-muted] truncate leading-tight">
                                {result.title}
                            </span>
                        </a>
                    ))}
                    {searchResults.length > 4 && (
                        <button
                            onClick={toggleExpansion}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[--card-hover] hover:bg-[--divider] border border-transparent hover:border-[--card-border] transition-all text-xs text-[--text-muted] hover:text-[--text-primary]"
                        >
                            {isExpanded ? 'Show less' : `+${searchResults.length - 4} more`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchResultsComponent;
