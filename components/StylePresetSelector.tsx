import React, { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { HairStylePreset } from '../types';

interface StylePresetSelectorProps {
  presets: HairStylePreset[];
  selectedPreset: HairStylePreset | null;
  onSelect: (preset: HairStylePreset) => void;
}

const FILTERS = [
  '전체',
  '숏',
  '미디엄',
  '롱',
  '남성',
  '여성',
  '펌/웨이브',
  '컬러',
] as const;

const matchesFilter = (preset: HairStylePreset, filter: string) => {
  if (filter === '전체') {
    return true;
  }

  if (filter === '남성') {
    return preset.category === 'men' || preset.tags.includes('남성');
  }

  if (filter === '여성') {
    return preset.category === 'women' || preset.tags.includes('여성');
  }

  return preset.tags.includes(filter);
};

const getPresetMeta = (preset: HairStylePreset) => {
  const hairSpec = preset.hairSpec as {
    overall?: { lengthLabel?: string };
    texture?: { baseTexture?: string };
  };

  return {
    lengthLabel: hairSpec.overall?.lengthLabel || 'style',
    texture: hairSpec.texture?.baseTexture || 'texture',
  };
};

const StylePresetSelector: React.FC<StylePresetSelectorProps> = ({
  presets,
  selectedPreset,
  onSelect,
}) => {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>('전체');

  const filteredPresets = useMemo(
    () => presets.filter((preset) => matchesFilter(preset, activeFilter)),
    [activeFilter, presets],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                isActive
                  ? 'border-[#7c3aed] bg-[#7c3aed] text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-[#7c3aed]/50 hover:text-[#6d28d9]'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filteredPresets.map((preset) => {
          const isSelected = selectedPreset?.id === preset.id;
          const visibleTags = preset.tags.slice(1, 4);
          const meta = getPresetMeta(preset);

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset)}
              aria-pressed={isSelected}
              className={`group overflow-hidden rounded-lg border bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                isSelected ? 'border-[#7c3aed] ring-2 ring-[#7c3aed]/25' : 'border-gray-200'
              }`}
            >
              <div className="relative aspect-[4/5] bg-gray-100">
                <img
                  src={preset.thumbnail}
                  alt={preset.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {isSelected && (
                  <div className="absolute right-2 top-2 rounded-full bg-[#7c3aed] p-1.5 text-white shadow-sm">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>

              <div className="space-y-2 p-3">
                <div>
                  <h4 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900">
                    {preset.name}
                  </h4>
                  <p className="mt-1 text-xs text-gray-500">
                    {meta.lengthLabel} · {meta.texture}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {visibleTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StylePresetSelector;
