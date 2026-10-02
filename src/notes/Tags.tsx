import type {Key} from "@heroui/react";

import {
  Description,
  Tag,
  TagGroup,
} from "@heroui/react";

type TagGroupWithListDataProps = {
  isExpanded?: boolean;
  tagsList: {id: string, name: string}[]
};

export function TagGroupWithListData({
  tagsList,
  isExpanded = true,
}: TagGroupWithListDataProps) {

  
  const onRemove = (keys: Set<Key>) => {
    console.log(keys)
  };

  return (
    <div>
      <TagGroup
        {...(isExpanded && {onRemove})}
        aria-label="Keywords"
        // selectedKeys={list.selectedKeys}
        // selectionMode="multiple"
        // onSelectionChange={(keys) => list.setSelectedKeys(keys)}
      >
        {isExpanded && (
          <Description>Tags are auto-generated</Description>
        )}

        <TagGroup.List
          items={tagsList}
          renderEmptyState={() => (
            <></>
          )}
        >
          {(item) => <Tag key={item.id}>{item.name}</Tag>}
        </TagGroup.List>
      </TagGroup>
    </div>
  );
}
