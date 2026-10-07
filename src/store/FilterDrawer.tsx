import { useState } from 'react';
import { TagGroups } from '../components/controls';
import { Drawer } from '../components/overlays';

interface Props {
  applied: string[];
  onApply: (tags: string[]) => void;
  onClose: () => void;
}

export function FilterDrawer({ applied, onApply, onClose }: Props) {
  const [picked, setPicked] = useState(applied);

  const toggle = (tag: string) => setPicked((tags) => (tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag]));

  return (
    <Drawer side="right" className="filter-drawer" label="Filter" onClose={onClose}>
      <div className="filter-head">
        <h2 className="filter-title">Filter</h2>
        <button className="filter-reset" onClick={() => setPicked([])}>
          Reset
        </button>
      </div>
      <div className="filter-body">
        <TagGroups selected={picked} onToggle={toggle} />
      </div>
      <div className="filter-foot">
        <button className="btn-apply" onClick={() => onApply(picked)}>
          Apply Filters
        </button>
      </div>
    </Drawer>
  );
}
