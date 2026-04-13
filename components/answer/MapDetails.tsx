// @ts-nocheck
"use client";
import React, { useState } from 'react';
import { Phone, Globe, CaretDown, CaretUp } from '@phosphor-icons/react';

interface Place {
    cid: React.Key | null | undefined;
    latitude: number;
    longitude: number;
    title: string;
    address: string;
    rating: number;
    category: string;
    phoneNumber?: string;
    website?: string;
}

const LocationSidebar = ({ places }: { places: Place[] }) => {
    const [showMore, setShowMore] = useState(false);
    const sliced = places.slice(0, 4);
    const visible = sliced.slice(0, showMore ? sliced.length : 3);

    return (
        <div className="bg-[--card-bg] border border-[--card-border] rounded-xl p-4 mt-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[--text-muted] mb-3">Locations</h2>
            <div className="flex flex-col gap-2">
                {visible.map((place: Place) => (
                    <div key={place.cid} className="rounded-lg bg-[--card-hover] p-3">
                        <p className="text-sm font-medium text-[--text-primary]">{place.title}</p>
                        <p className="text-xs text-[--text-muted] mt-0.5">{place.address}</p>
                        {place.rating > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs text-yellow-500">{'★'.repeat(Math.min(Math.floor(place.rating), 5))}</span>
                                <span className="text-xs text-[--text-muted]">{place.rating.toFixed(1)}</span>
                            </div>
                        )}
                        <p className="text-xs text-[--text-muted] mt-0.5">{place.category}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                            {place.phoneNumber && (
                                <a href={`tel:${place.phoneNumber}`} className="flex items-center gap-1 text-xs text-[--text-muted] hover:text-[--text-primary] transition-colors">
                                    <Phone size={12} /> {place.phoneNumber}
                                </a>
                            )}
                            {place.website && (
                                <a href={place.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[--text-muted] hover:text-[--text-primary] transition-colors truncate">
                                    <Globe size={12} /> Website
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {sliced.length > 3 && (
                <button
                    onClick={() => setShowMore(!showMore)}
                    className="flex items-center gap-1.5 mt-2 text-xs text-[--text-muted] hover:text-[--text-primary] transition-colors"
                >
                    {showMore ? <CaretUp size={12} /> : <CaretDown size={12} />}
                    {showMore ? 'Show less' : 'Show more'}
                </button>
            )}
        </div>
    );
};

export default LocationSidebar;
