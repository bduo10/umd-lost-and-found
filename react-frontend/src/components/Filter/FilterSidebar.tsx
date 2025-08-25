import './FilterSidebar.css';

interface FilterSidebarProps {
    selectedItemType: string;
    onFilterChange: (itemType: string) => void;
}

export default function FilterSidebar({ selectedItemType, onFilterChange }: FilterSidebarProps) {
    const filterOptions = [
        { value: 'ALL', label: 'All Items' },
        { value: 'BOOK', label: 'Books' },
        { value: 'CLOTHING', label: 'Clothing' },
        { value: 'ELECTRONICS', label: 'Electronics' },
        { value: 'WATERBOTTLE', label: 'Water Bottles' },
        { value: 'ACCESSORIES', label: 'Accessories' },
        { value: 'ID', label: 'ID Cards' },
        { value: 'WALLET', label: 'Wallets' },
        { value: 'KEYS', label: 'Keys' },
        { value: 'BAGS', label: 'Bags' },
        { value: 'OTHER', label: 'Other' }
    ];

    return (
        <div className="filter-sidebar">
            <div className="filter-header">
                <h3>Filter by Item Type</h3>
            </div>
            
            <div className="filter-options">
                {filterOptions.map((option) => (
                    <label key={option.value} className="filter-option">
                        <input
                            type="radio"
                            name="itemType"
                            value={option.value}
                            checked={selectedItemType === option.value}
                            onChange={(e) => onFilterChange(e.target.value)}
                        />
                        <span className="filter-label">{option.label}</span>
                    </label>
                ))}
            </div>
            
            {selectedItemType !== 'ALL' && (
                <button 
                    className="clear-filter-btn"
                    onClick={() => onFilterChange('ALL')}
                >
                    Clear Filter
                </button>
            )}
        </div>
    );
}
