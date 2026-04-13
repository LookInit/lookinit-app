import { useState } from 'react';
import { X, ArrowSquareOut } from '@phosphor-icons/react';

interface ShoppingItem {
    title: string;
    source: string;
    link: string;
    price: string;
    delivery: string;
    imageUrl: string;
    rating: number;
    ratingCount: number;
    offers: string;
    productId: string;
    position: number;
}

interface ShoppingComponentProps {
    shopping: ShoppingItem[];
}

const ShoppingComponent: React.FC<ShoppingComponentProps> = ({ shopping }) => {
    const [showModal, setShowModal] = useState(false);

    const ShoppingSkeleton = () => (
        <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-lg bg-[--card-hover] flex-shrink-0" />
                    <div className="flex-1 flex flex-col gap-1.5">
                        <div className="h-3 rounded bg-[--card-hover] w-3/4" />
                        <div className="h-3 rounded bg-[--card-hover] w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <>
            <div className="bg-[--card-bg] border border-[--card-border] rounded-xl p-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Shopping</h2>
                    {shopping.length > 0 && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="text-xs text-[--text-muted] hover:text-[--text-primary] transition-colors"
                        >
                            View all
                        </button>
                    )}
                </div>
                {shopping.length === 0 ? (
                    <ShoppingSkeleton />
                ) : (
                    <div className="flex flex-col gap-3">
                        {shopping.slice(0, 3).map((item, i) => (
                            <a
                                key={i}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 group"
                            >
                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[--card-hover]">
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-[--text-primary] group-hover:underline truncate">{item.title}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-xs text-[--text-muted]">{item.source}</span>
                                        {item.rating > 0 && (
                                            <span className="text-xs text-yellow-500">{'★'.repeat(Math.min(Math.floor(item.rating), 5))}</span>
                                        )}
                                    </div>
                                    <p className="text-xs font-semibold text-[--text-primary] mt-0.5">{item.price}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-[--card-bg] border border-[--card-border] rounded-2xl w-full max-w-xl max-h-[80vh] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[--divider]">
                            <h2 className="text-sm font-semibold text-[--text-primary]">Shopping Results</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg text-[--text-muted] hover:text-[--text-primary] hover:bg-[--card-hover] transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-5 flex flex-col gap-4 scrollbar-thin">
                            {shopping.map((item, i) => (
                                <a
                                    key={i}
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 group"
                                >
                                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[--card-hover]">
                                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[--text-primary] group-hover:underline line-clamp-2">{item.title}</p>
                                        <p className="text-xs text-[--text-muted] mt-0.5">{item.source}</p>
                                        {item.rating > 0 && (
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <span className="text-xs text-yellow-500">{'★'.repeat(Math.min(Math.floor(item.rating), 5))}</span>
                                                <span className="text-xs text-[--text-muted]">({item.ratingCount})</span>
                                            </div>
                                        )}
                                        <p className="text-sm font-semibold text-[--text-primary] mt-1">{item.price}</p>
                                        {item.delivery && <p className="text-xs text-[--text-muted] mt-0.5">{item.delivery}</p>}
                                    </div>
                                    <ArrowSquareOut size={16} className="flex-shrink-0 text-[--text-muted] group-hover:text-[--text-primary] transition-colors" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ShoppingComponent;
